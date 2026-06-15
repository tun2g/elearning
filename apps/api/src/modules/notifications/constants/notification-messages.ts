import type { LeaderboardEntry, NotificationType } from '@elearning/contracts';
import type { ExpoPushMessage } from 'expo-server-sdk';

/** Local hour (user timezone) the streak-danger nudge fires. */
export const STREAK_DANGER_HOUR = 22;
/** Local hour on Sunday the weekly recap fires. */
export const WEEKLY_SUMMARY_HOUR = 18;

/** Shared content used for both the Expo push and the persisted in-app inbox. */
export interface NotificationContent {
  type: NotificationType;
  title: string;
  body: string;
}

export function dailyReminderContent(remaining: number): NotificationContent {
  return {
    type: 'daily_reminder',
    title: '🎧 Time to practice',
    body:
      remaining > 0
        ? `You're ${remaining} sentence${remaining === 1 ? '' : 's'} from today's goal. Keep it going!`
        : `A few minutes of speaking keeps your streak alive.`,
  };
}

export function streakDangerContent(streak: number): NotificationContent {
  return {
    type: 'streak_danger',
    title: '🔥 Streak in danger',
    body: `Your ${streak}-day streak ends at midnight — one quick session saves it.`,
  };
}

export function weeklySummaryContent(entry: LeaderboardEntry | null): NotificationContent {
  return {
    type: 'weekly_summary',
    title: '📊 Your weekly recap',
    body: entry
      ? `You ranked #${entry.rank} with ${entry.xpThisWeek} XP this week. 🏆`
      : `A new week starts now — climb the leaderboard! 🏆`,
  };
}

export function levelUpContent(rank: string): NotificationContent {
  return {
    type: 'level_up',
    title: '⭐ Level up!',
    body: `You reached ${rank}. Keep speaking to climb even higher.`,
  };
}

/** Wrap shared content as an Expo push message for a given token. */
export function toPushMessage(to: string, content: NotificationContent): ExpoPushMessage {
  return { to, sound: 'default', title: content.title, body: content.body, data: { type: content.type } };
}
