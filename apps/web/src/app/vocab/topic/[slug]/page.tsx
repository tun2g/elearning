import dynamic from 'next/dynamic';

import { Preloader } from '@/components/ui/preloader';

const VocabContainer = dynamic(() => import('@/components/vocab/vocab-container').then((m) => m.VocabContainer), {
  loading: () => <Preloader />,
});

export default function VocabTopicPage() {
  return <VocabContainer />;
}
