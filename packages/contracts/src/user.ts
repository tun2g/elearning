import { z } from 'zod';

export const UserSettingsSchema = z.object({
  dailyGoalSentences: z.number().int().min(1).max(100),
  pushToken: z.string().nullable(),
  notificationEnabled: z.boolean(),
  /** Local hour (0–23) the daily reminder fires, in the user's timezone. */
  reminderHour: z.number().int().min(0).max(23),
  /** IANA timezone, e.g. "Asia/Ho_Chi_Minh". */
  timezone: z.string(),
});
export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const UpdateSettingsSchema = UserSettingsSchema.partial();
export type UpdateSettings = z.infer<typeof UpdateSettingsSchema>;
