import dynamic from 'next/dynamic';

import { Preloader } from '@/components/ui/preloader';

const LeaderboardContainer = dynamic(
  () => import('@/components/leaderboard/leaderboard-container').then((m) => m.LeaderboardContainer),
  { loading: () => <Preloader /> }
);

export default function LeaderboardPage() {
  return <LeaderboardContainer />;
}
