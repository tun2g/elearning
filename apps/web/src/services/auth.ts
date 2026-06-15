import type { AuthTokens, RegisterResult, User } from '@elearning/contracts';

import { apiGet, doFetch } from '@/lib/api';

/** Error carrying the API's stable `code` (e.g. EMAIL_NOT_VERIFIED) for UI branching. */
export class AuthError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

async function postJson<T>(path: string, body: unknown, fallbackMessage: string): Promise<T> {
  const r = await doFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = (await r.json().catch(() => ({}))) as { message?: string | string[]; code?: string };
    const message = Array.isArray(err.message) ? err.message.join(', ') : (err.message ?? fallbackMessage);
    throw new AuthError(message, err.code);
  }
  return r.json() as Promise<T>;
}

export function loginApi(email: string, password: string): Promise<AuthTokens> {
  return postJson<AuthTokens>('/auth/login', { email, password }, 'Invalid email or password');
}

export function registerApi(email: string, password: string, displayName: string): Promise<RegisterResult> {
  return postJson<RegisterResult>('/auth/register', { email, password, displayName }, 'Registration failed');
}

export function verifyEmailApi(token: string): Promise<AuthTokens> {
  return postJson<AuthTokens>('/auth/verify-email', { token }, 'Verification failed');
}

export function resendVerificationApi(email: string): Promise<void> {
  return postJson<{ status: string }>('/auth/resend-verification', { email }, 'Could not resend').then(() => undefined);
}

export function magicLinkApi(email: string): Promise<void> {
  return postJson<{ status: string }>('/auth/magic-link', { email }, 'Could not send link').then(() => undefined);
}

export function magicLinkVerifyApi(token: string): Promise<AuthTokens> {
  return postJson<AuthTokens>('/auth/magic-link/verify', { token }, 'Sign-in link invalid');
}

export function refreshApi(refreshToken: string): Promise<AuthTokens> {
  return doFetch('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).then(async (r) => {
    if (!r.ok) throw new Error('Refresh failed');
    return r.json() as Promise<AuthTokens>;
  });
}

export function logoutApi(refreshToken: string): Promise<void> {
  return doFetch('/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(() => undefined)
    .catch(() => undefined); // best-effort revocation
}

export function getMeApi(token: string): Promise<User> {
  return apiGet<User>('/auth/me', token);
}
