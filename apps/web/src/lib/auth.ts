'use client';

import type { AuthTokens, RegisterResult } from '@elearning/contracts';

import {
  loginApi,
  logoutApi,
  magicLinkApi,
  magicLinkVerifyApi,
  refreshApi,
  registerApi,
  verifyEmailApi,
} from '@/services/auth';

const ACCESS_TOKEN_KEY = 'el_access_token';
const REFRESH_TOKEN_KEY = 'el_refresh_token';

// --- access token (sessionStorage — cleared when tab closes) ---

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

// --- refresh token (localStorage — survives tab close, matches 30d server expiry) ---

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// --- auth actions ---

/** Stores a fresh token pair (after login / verify / magic-link / Google). */
export function setSession(tokens: { accessToken: string; refreshToken: string }): void {
  setAccessToken(tokens.accessToken);
  setRefreshToken(tokens.refreshToken);
}

export async function login(email: string, password: string): Promise<void> {
  setSession(await loginApi(email, password));
}

/** Registers and triggers a verification email — does NOT start a session. */
export async function register(email: string, password: string, displayName: string): Promise<RegisterResult> {
  return registerApi(email, password, displayName);
}

/** Consumes an email-verification token and logs the user in. */
export async function verifyEmail(token: string): Promise<void> {
  setSession(await verifyEmailApi(token));
}

/** Consumes a passwordless sign-in link and logs the user in. */
export async function verifyMagicLink(token: string): Promise<void> {
  setSession(await magicLinkVerifyApi(token));
}

/** Requests a passwordless sign-in link by email. */
export async function requestMagicLink(email: string): Promise<void> {
  await magicLinkApi(email);
}

export function logout(): void {
  const refreshToken = getRefreshToken();
  if (refreshToken) void logoutApi(refreshToken); // revoke server-side (best-effort)
  clearAccessToken();
  clearRefreshToken();
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

// --- silent token renewal ---

let refreshing: Promise<boolean> | null = null;

/** Attempts to renew the access token using the stored refresh token.
 *  Returns true on success, false if the refresh token is absent or rejected. */
export async function refreshAccessToken(): Promise<boolean> {
  // Deduplicate concurrent calls — only one refresh flies at a time.
  if (refreshing) return refreshing;

  refreshing = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const tokens = await refreshApi(refreshToken);
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      return true;
    } catch {
      logout();
      return false;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}
