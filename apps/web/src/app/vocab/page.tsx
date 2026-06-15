import dynamic from 'next/dynamic';

import { Preloader } from '@/components/ui/preloader';

const VocabCatalogContainer = dynamic(
  () => import('@/components/vocab/vocab-catalog-container').then((m) => m.VocabCatalogContainer),
  { loading: () => <Preloader /> }
);

export default function VocabPage() {
  return <VocabCatalogContainer />;
}
