import dynamic from 'next/dynamic';

import { Preloader } from '@/components/ui/preloader';

const HomeContainer = dynamic(() => import('@/components/home/home-container').then((m) => m.HomeContainer), {
  loading: () => <Preloader />,
});

export default function HomePage() {
  return <HomeContainer />;
}
