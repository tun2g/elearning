import { z } from 'zod';

export const NotificationTypeSchema = z.enum(['daily_reminder', 'streak_danger', 'weekly_summary', 'level_up']);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationSchema = z.object({
  id: z.string(),
  type: NotificationTypeSchema,
  title: z.string(),
  body: z.string(),
  data: z.record(z.string(), z.unknown()).nullable(),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type Notification = z.infer<typeof NotificationSchema>;

export const NotificationListSchema = z.object({
  notifications: z.array(NotificationSchema),
  unreadCount: z.number().int(),
});
export type NotificationList = z.infer<typeof NotificationListSchema>;
