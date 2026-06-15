import type { HomeData } from '@/hooks/use-home';
import { Link } from 'expo-router';
import { MotiView } from 'moti';
import * as React from 'react';

import { Pressable, ScrollView, View } from 'react-native';
import { CopilotStep, walkthroughable } from 'react-native-copilot';

import { NotificationBell } from '@/components/notifications/notification-bell';
import { FocusAwareStatusBar, Text } from '@/components/ui';
import { useHomeTour } from '@/hooks/use-home-tour';
import { useLeaderboard } from '@/hooks/use-leaderboard';
import { useMe } from '@/hooks/use-me';

const SOURCE_RE = /_/g;
const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
const WalkthroughView = walkthroughable(View);

function greeting() {
  const h = new Date().getHours();
  if (h < 12)
    return 'Good morning';
  if (h < 18)
    return 'Good afternoon';
  return 'Good evening';
}

function Card({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 450, delay }}
      className={className}
    >
      {children}
    </MotiView>
  );
}

function StreakHero({ streak }: { streak: HomeData['streak'] }) {
  return (
    <Card
      delay={80}
      className="mx-4 mb-4 overflow-hidden rounded-3xl bg-primary-500 p-6"
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-medium text-white/80">
            {streak.isAlive ? 'Streak alive' : 'Streak paused'}
          </Text>
          <View className="mt-1 flex-row items-end gap-2">
            <Text className="text-5xl leading-none font-extrabold text-white">
              {streak.currentStreak}
            </Text>
            <Text className="mb-1 text-lg font-semibold text-white/80">
              {streak.currentStreak === 1 ? 'day' : 'days'}
            </Text>
          </View>
          <Text className="mt-2 text-xs text-white/70">
            {`Longest streak · ${streak.longestStreak} days`}
          </Text>
        </View>
        <View className="size-16 items-center justify-center rounded-2xl bg-white/20">
          <Text className="text-3xl">🔥</Text>
        </View>
      </View>
    </Card>
  );
}

function DailyGoalCard({ goal }: { goal: HomeData['dailyGoal'] }) {
  return (
    <Card
      delay={150}
      className="mx-4 mb-4 rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800"
    >
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-semibold">Daily goal</Text>
        <Text className="text-xs text-neutral-500">
          {`${goal.completedSentences}/${goal.targetSentences} sentences`}
        </Text>
      </View>
      <View className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
        <View
          className="h-full rounded-full bg-secondary-500"
          style={{ width: `${goal.percentage}%` }}
        />
      </View>
      {goal.completed && (
        <Text className="mt-3 text-xs font-medium text-secondary-600">
          Goal complete for today! ✓
        </Text>
      )}
    </Card>
  );
}

function QuickActions() {
  return (
    <Card delay={210} className="mx-4 mb-4 flex-row gap-3">
      <CopilotStep
        order={1}
        name="practice"
        text="Start here — listen to a native line, shadow it, and speak it back. This is your daily loop."
      >
        <WalkthroughView className="flex-1">
          <Link href="/lessons" asChild>
            <Pressable className="flex-1 rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800">
              <View className="size-11 items-center justify-center rounded-2xl bg-primary-100">
                <Text className="text-xl">🎤</Text>
              </View>
              <Text className="mt-4 font-semibold">Practice</Text>
            </Pressable>
          </Link>
        </WalkthroughView>
      </CopilotStep>
      <Link href="/vocab" asChild>
        <Pressable className="flex-1 rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800">
          <View className="size-11 items-center justify-center rounded-2xl bg-secondary-100">
            <Text className="text-xl">📚</Text>
          </View>
          <Text className="mt-4 font-semibold">Review</Text>
        </Pressable>
      </Link>
    </Card>
  );
}

function RecommendedCard({
  lesson,
}: {
  lesson: NonNullable<HomeData['recommendedLesson']>;
}) {
  return (
    <Card delay={270} className="mx-4 mb-4">
      <Text className="mb-2 text-xs font-semibold text-neutral-500">
        Continue practicing
      </Text>
      <Link href={`/lessons/${lesson.slug}`} asChild>
        <Pressable className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800">
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-base font-semibold">{lesson.title}</Text>
            <View className="rounded-full bg-neutral-100 px-2.5 py-0.5 dark:bg-neutral-700">
              <Text className="text-xs text-neutral-500 capitalize">
                {lesson.level}
              </Text>
            </View>
          </View>
          <View className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
            <View
              className="h-full rounded-full bg-primary-500"
              style={{ width: `${lesson.completionPct}%` }}
            />
          </View>
          <Text className="mt-2 text-xs text-neutral-400">
            {`${lesson.completionPct}% complete`}
          </Text>
        </Pressable>
      </Link>
    </Card>
  );
}

function RecentXpCard({ recentXp }: { recentXp: HomeData['recentXp'] }) {
  return (
    <Card
      delay={330}
      className="mx-4 rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800"
    >
      <Text className="mb-2 text-xs font-semibold text-neutral-500">
        Recent XP
      </Text>
      {recentXp.map(e => (
        <View
          key={`${e.sourceType}-${e.createdAt}`}
          className="flex-row items-center justify-between border-t border-neutral-100 py-2.5 dark:border-neutral-700"
        >
          <Text className="text-sm text-neutral-600 capitalize">
            {e.sourceType.replace(SOURCE_RE, ' ')}
          </Text>
          <Text className="text-sm font-semibold text-primary-600">
            {`+${e.amount} XP`}
          </Text>
        </View>
      ))}
    </Card>
  );
}

function LeaderboardCard() {
  const { data: entries } = useLeaderboard();
  const { data: me } = useMe();

  if (!entries || entries.length === 0)
    return null;

  return (
    <Card
      delay={300}
      className="mx-4 mb-4 rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800"
    >
      <Text className="mb-2 text-xs font-semibold text-neutral-500">
        Weekly leaderboard
      </Text>
      {entries.slice(0, 5).map((entry) => {
        const isMe = entry.userId === me?.id;
        return (
          <View
            key={entry.userId}
            className={`flex-row items-center border-t border-neutral-100 py-2.5 dark:border-neutral-700 ${
              isMe ? 'rounded-xl bg-primary-50 dark:bg-primary-900/30' : ''
            }`}
          >
            <Text className="w-7 text-sm font-semibold text-neutral-500">
              {MEDALS[entry.rank] ?? entry.rank}
            </Text>
            <Text className="flex-1 text-sm font-medium" numberOfLines={1}>
              {entry.displayName}
              {isMe ? ' · You' : ''}
            </Text>
            <Text className="text-sm font-semibold text-primary-600">
              {`${entry.xpThisWeek.toLocaleString()} XP`}
            </Text>
          </View>
        );
      })}
    </Card>
  );
}

export function HomeContent({ data }: { data: HomeData }) {
  useHomeTour();
  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <FocusAwareStatusBar />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-row items-start justify-between px-4 pt-6 pb-2">
          <View className="flex-1">
            <Text className="text-sm font-medium text-neutral-500">
              {`${greeting()} 👋`}
            </Text>
            <Text className="mt-1 text-3xl font-extrabold">Ready to speak?</Text>
          </View>
          <NotificationBell />
        </View>

        <StreakHero streak={data.streak} />
        <DailyGoalCard goal={data.dailyGoal} />
        <QuickActions />
        {data.recommendedLesson && (
          <RecommendedCard lesson={data.recommendedLesson} />
        )}
        <LeaderboardCard />
        {data.recentXp.length > 0 && <RecentXpCard recentXp={data.recentXp} />}
      </ScrollView>
    </View>
  );
}
