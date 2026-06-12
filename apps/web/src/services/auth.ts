import type { AuthTokens, User } from '@elearning/contracts';

import { apiGet, doFetch } from '@/lib/api';

export function loginApi(email: string, password: string): Promise<AuthTokens> {
  return doFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(async (r) => {
    if (!r.ok) {
      const err = await r.json().catch(() => ({ message: 'Login failed' }));
      throw new Error((err as { message?: string }).message ?? 'Invalid email or password');
    }
    return r.json() as Promise<AuthTokens>;
  });
}

export function registerApi(email: string, password: string, displayName: string): Promise<AuthTokens> {
  return doFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName }),
  }).then(async (r) => {
    if (!r.ok) {
      const err = await r.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error((err as { message?: string }).message ?? 'Registration failed');
    }
    return r.json() as Promise<AuthTokens>;
  });
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
