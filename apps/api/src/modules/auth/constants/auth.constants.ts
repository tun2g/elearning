/** TTL for the email-verification link. */
export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24h
export const VERIFY_TTL_HOURS = 24;

/** TTL for the passwordless sign-in link. */
export const LOGIN_TTL_MS = 15 * 60 * 1000; // 15m
export const LOGIN_TTL_MINUTES = 15;

/** Don't re-issue a fresh token if an unused one was sent within this window. */
export const RESEND_THROTTLE_MS = 30 * 1000; // 30s
