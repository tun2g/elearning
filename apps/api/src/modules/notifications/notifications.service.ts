import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import type { LeaderboardEntry } from '@elearning/contracts';
import type { ExpoPushMessage } from 'expo-server-sdk';
import { Repository } from 'typeorm';

import { GamificationService } from 'src/modules/gamification/gamification.service';
import { LeaderboardService } from 'src/modules/leaderboard/leaderboard.service';
import { ProgressService } from 'src/modules/progress/progress.service';
import { UserSettingsEntity } from 'src/modules/user/entities/user-settings.entity';

import {
  STREAK_DANGER_HOUR,
  WEEKLY_SUMMARY_HOUR,
  type NotificationContent,
  dailyReminderContent,
  streakDangerContent,
  toPushMessage,
  weeklySummaryContent,
} from './constants/notification-messages';
import { ExpoPushService } from './expo-push.service';
import { InAppNotificationService } from './in-app-notification.service';

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(UserSettingsEntity)
    private readonly settingsRepo: Repository<UserSettingsEntity>,
    private readonly expoPush: ExpoPushService,
    private readonly inApp: InAppNotificationService,
    private readonly gamification: GamificationService,
    private readonly progress: ProgressService,
    private readonly leaderboard: LeaderboardService
  ) {}

  /**
   * Runs every hour and, per user, fires whichever reminders match their local
   * clock: daily goal nudge at their reminder hour, streak-danger at 22:00, and
   * a weekly recap on Sunday evening. Every trigger is persisted to the in-app
   * inbox; a push is additionally sent only when the user has a token.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async runHourly(): Promise<void> {
    const recipients = await this.settingsRepo.find({
      where: { notificationEnabled: true },
      relations: { user: true },
    });
    if (recipients.length === 0) return;

    const now = new Date();
    const todayUtcDay = Math.floor(now.getTime() / DAY_MS);
    const messages: ExpoPushMessage[] = [];
    let weeklyRanks: Map<string, LeaderboardEntry> | null = null;

    for (const settings of recipients) {
      const local = this.localClock(now, settings.timezone);
      if (!local) continue;
      const userId = settings.user.id;

      // Always persist to the inbox; queue a push too only if a token exists.
      const emit = async (content: NotificationContent): Promise<void> => {
        await this.inApp.create(userId, content);
        if (settings.pushToken) messages.push(toPushMessage(settings.pushToken, content));
      };

      // Streak danger takes priority: a user who hasn't practiced today and
      // whose streak is alive (last active was yesterday) loses it at midnight.
      let sentStreakDanger = false;
      if (local.hour === STREAK_DANGER_HOUR) {
        const streak = await this.progress.getStreak(userId);
        if (streak.currentStreak > 0 && streak.lastActiveDay !== todayUtcDay) {
          await emit(streakDangerContent(streak.currentStreak));
          sentStreakDanger = true;
        }
      }

      // Skip the daily nudge if we just sent the stronger streak-danger one.
      if (local.hour === settings.reminderHour && !sentStreakDanger) {
        const goal = await this.gamification.getDailyGoal(userId, settings.dailyGoalSentences);
        if (!goal.completed) {
          await emit(dailyReminderContent(goal.targetSentences - goal.completedSentences));
        }
      }

      if (local.weekday === 0 && local.hour === WEEKLY_SUMMARY_HOUR) {
        if (!weeklyRanks) weeklyRanks = await this.loadWeeklyRanks();
        await emit(weeklySummaryContent(weeklyRanks.get(userId) ?? null));
      }
    }

    if (messages.length > 0) {
      this.logger.log(`Dispatching ${messages.length} scheduled notification(s)`);
      await this.expoPush.send(messages);
    }
  }

  private async loadWeeklyRanks(): Promise<Map<string, LeaderboardEntry>> {
    const entries = await this.leaderboard.getWeekly();
    return new Map(entries.map((e) => [e.userId, e]));
  }

  /** The user's local hour (0–23) and weekday (0=Sun) for `date`, or null on a bad timezone. */
  private localClock(date: Date, timeZone: string): { hour: number; weekday: number } | null {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hourCycle: 'h23',
        hour: '2-digit',
        weekday: 'short',
      }).formatToParts(date);
      const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
      const weekday = WEEKDAY_INDEX[parts.find((p) => p.type === 'weekday')?.value ?? 'Sun'] ?? 0;
      return { hour, weekday };
    } catch {
      this.logger.warn(`Invalid timezone "${timeZone}" — skipping notifications for this user`);
      return null;
    }
  }
}
