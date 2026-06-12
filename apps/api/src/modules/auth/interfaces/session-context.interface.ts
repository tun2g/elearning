/** Where the request came from — recorded on the session for device management. */
export interface SessionContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** Decoded JWT payload for access/refresh tokens. */
export interface AccessClaims {
  sub: string;
  email: string;
  sessionId: string;
  type: 'access' | 'refresh';
}
