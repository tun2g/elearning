import dynamic from 'next/dynamic';

import { Preloader } from '@/components/ui/preloader';

const LessonsContainer = dynamic(
  () => import('@/components/lessons/lessons-container').then((m) => m.LessonsContainer),
  {
    loading: () => <Preloader />,
  }
);

export default function LessonsPage() {
  return <LessonsContainer />;
}
