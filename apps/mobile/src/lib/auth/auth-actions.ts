import Env from 'env';
import * as WebBrowser from 'expo-web-browser';

import { client } from '@/lib/api/client';

import { signIn } from './use-auth-store';

WebBrowser.maybeCompleteAuthSession();

/** Error carrying the API's stable `code` (e.g. EMAIL_NOT_VERIFIED). */
export class AuthError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

type ApiErrorData = { response?: { data?: { code?: string; message?: string } } };

function parseTokens(url: string): { access: string; refresh: string } | null {
  const fragment = url.split('#')[1] ?? url.split('?')[1] ?? '';
  const params = new URLSearchParams(fragment);
  const access = params.get('accessToken');
  const refresh = params.get('refreshToken');
  return access && refresh ? { access, refresh } : null;
}

/**
 * Opens Google OAuth in a browser session and captures the redirect back to the
 * app scheme. The backend redirects to `<scheme>://auth/callback#tokens`, so the
 * api's APP_DEEP_LINK_SCHEME must match EXPO_PUBLIC_SCHEME.
 */
export async function googleSignIn(): Promise<void> {
  const returnUrl = `${Env.EXPO_PUBLIC_SCHEME}://auth/callback`;
  const authUrl = `${Env.EXPO_PUBLIC_API_URL}/auth/google?platform=mobile`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);
  if (result.type !== 'success' || !result.url)
    throw new Error('Google sign-in was cancelled');

  const tokens = parseTokens(result.url);
  if (!tokens)
    throw new Error('Google sign-in failed');
  signIn(tokens);
}

export async function requestMagicLink(email: string): Promise<void> {
  await client.post('/auth/magic-link', { email });
}

export async function resendVerification(email: string): Promise<void> {
  await client.post('/auth/resend-verification', { email });
}

/** Password login → stores the session. Throws AuthError (carries EMAIL_NOT_VERIFIED). */
export async function passwordLogin(email: string, password: string): Promise<void> {
  try {
    const res = await client.post<{ accessToken: string; refreshToken: string }>('/auth/login', { email, password });
    signIn({ access: res.data.accessToken, refresh: res.data.refreshToken });
  }
  catch (err) {
    const code = (err as ApiErrorData)?.response?.data?.code;
    throw new AuthError(
      code === 'EMAIL_NOT_VERIFIED' ? 'Please verify your email before signing in.' : 'Invalid email or password',
      code,
    );
  }
}

export async function registerWithPassword(email: string, password: string, displayName: string): Promise<void> {
  await client.post('/auth/register', { email, password, displayName });
}
