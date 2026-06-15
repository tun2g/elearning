import config from './config';

const API_URL = config.apiUrl;

// Lazy import to avoid circular dep (auth imports api, api imports auth for refresh)
async function getAuthModule() {
  return import('./auth');
}

export async function doFetch(path: string, init: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, { cache: 'no-store', ...init });
}

/** Makes an authenticated request with one silent-refresh retry on 401. */
async function apiFetch<T>(path: string, init: RequestInit, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await doFetch(path, { ...init, headers });

  if (res.status === 401 && token) {
    const auth = await getAuthModule();
    const refreshed = await auth.refreshAccessToken();
    if (refreshed) {
      const newToken = auth.getAccessToken();
      const retryHeaders = {
        ...headers,
        ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
      };
      const retryRes = await doFetch(path, { ...init, headers: retryHeaders });
      if (!retryRes.ok) {
        await auth.logout();
        throw new Error(`Unauthorized — redirecting to login`);
      }
      return retryRes.json() as Promise<T>;
    } else {
      throw new Error(`Unauthorized — redirecting to login`);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error((err as { message?: string }).message ?? `API ${path} failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  return apiFetch<T>(path, {}, token);
}

export async function apiPost<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  return apiFetch<T>(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    token
  );
}

export async function apiPatch<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  return apiFetch<T>(
    path,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    token
  );
}
