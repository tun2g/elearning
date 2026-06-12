import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  xpTotal: z.number().int(),
  levelRank: z.string(),
  createdAt: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;

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
