import dynamic from 'next/dynamic';

import { Preloader } from '@/components/ui/preloader';

const SettingsContainer = dynamic(
  () => import('@/components/settings/settings-container').then((m) => m.SettingsContainer),
  { loading: () => <Preloader /> }
);

export default function SettingsPage() {
  return <SettingsContainer />;
}
