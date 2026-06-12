import type { AuthTokens, LessonDetail, LessonSummary, User } from '@elearning/contracts';

import config from './config';

const API_URL = config.apiUrl;

// Lazy import to avoid circular dep (auth imports api, api imports auth for refresh)
async function getAuthModule() {
  return import('./auth');
}

async function doFetch(path: string, init: RequestInit): Promise<Response> {
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

async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  return apiFetch<T>(path, {}, token);
}

async function apiPost<T>(path: string, body: unknown, token?: string | null): Promise<T> {
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

// --- Auth (no token needed, no retry) ---

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

// --- Content (public) ---
export function getLessons(): Promise<LessonSummary[]> {
  return apiGet<LessonSummary[]>('/lessons');
}

export function getLesson(slug: string): Promise<LessonDetail> {
  return apiGet<LessonDetail>(`/lessons/${slug}`);
}

// --- Authenticated ---

export interface HomeData {
  streak: { currentStreak: number; longestStreak: number; isAlive: boolean };
  dailyGoal: {
    targetSentences: number;
    completedSentences: number;
    percentage: number;
    completed: boolean;
  };
  recommendedLesson: {
    slug: string;
    title: string;
    level: string;
    completionPct: number;
  } | null;
  recentXp: Array<{ amount: number; sourceType: string; createdAt: string }>;
}

export interface VocabCard {
  id: string;
  word: string;
  meaningVn: string;
  ipa: string | null;
  synonyms: string[];
  exampleSentences: string[];
}

export type Assessment = 'again' | 'hard' | 'easy';

export function getHome(token: string): Promise<HomeData> {
  return apiGet<HomeData>('/home', token);
}

export function getVocabReview(token: string): Promise<VocabCard[]> {
  return apiGet<VocabCard[]>('/vocabulary/review', token);
}

export interface LessonState {
  completionPct: number;
  status: string;
  attempts: { sentenceId: string; selfAssessment: Assessment }[];
}

export function getLessonState(token: string, lessonId: string): Promise<LessonState> {
  return apiGet<LessonState>(`/practice/lesson/${lessonId}`, token);
}

export function postVocabAttempt(token: string, input: { vocabId: string; assessment: Assessment }): Promise<unknown> {
  return apiPost(
    '/vocabulary/attempt',
    {
      vocabId: input.vocabId,
      correct: input.assessment === 'easy',
      assessment: input.assessment,
    },
    token
  );
}

export function postPracticeAttempt(
  token: string,
  input: { sentenceId: string; assessment: Assessment }
): Promise<unknown> {
  return apiPost(
    '/practice/attempt',
    {
      sentenceId: input.sentenceId,
      mode: 'listen',
      selfAssessment: input.assessment,
    },
    token
  );
}
