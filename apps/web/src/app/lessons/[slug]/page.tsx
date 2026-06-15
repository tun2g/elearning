import dynamic from 'next/dynamic';

import { Preloader } from '@/components/ui/preloader';

const PracticeContainer = dynamic(
  () => import('@/components/practice/practice-container').then((m) => m.PracticeContainer),
  { loading: () => <Preloader /> }
);

export default function LessonPage() {
  return <PracticeContainer />;
}
