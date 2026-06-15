import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  xpTotal: z.number().int(),
  levelRank: z.string(),
  emailVerified: z.boolean(),
  /** False for Google/passwordless-only accounts (no password set). */
  hasPassword: z.boolean(),
  createdAt: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;

/** Stable error codes the API returns in error bodies (e.g. on login). */
export const AuthErrorCode = {
  EmailNotVerified: 'EMAIL_NOT_VERIFIED',
} as const;
export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const RegisterDtoSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2),
  password: z.string().min(6),
});
export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

export const LoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginDto = z.infer<typeof LoginDtoSchema>;

/** register() no longer returns a session — it sends a verification email. */
export const RegisterResultSchema = z.object({
  status: z.literal('verification_sent'),
});
export type RegisterResult = z.infer<typeof RegisterResultSchema>;

export const VerifyEmailDtoSchema = z.object({ token: z.string().min(1) });
export type VerifyEmailDto = z.infer<typeof VerifyEmailDtoSchema>;

export const MagicLinkRequestDtoSchema = z.object({ email: z.string().email() });
export type MagicLinkRequestDto = z.infer<typeof MagicLinkRequestDtoSchema>;

export const MagicLinkVerifyDtoSchema = z.object({ token: z.string().min(1) });
export type MagicLinkVerifyDto = z.infer<typeof MagicLinkVerifyDtoSchema>;

export const ResendVerificationDtoSchema = z.object({ email: z.string().email() });
export type ResendVerificationDto = z.infer<typeof ResendVerificationDtoSchema>;
