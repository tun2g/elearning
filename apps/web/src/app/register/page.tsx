import dynamic from 'next/dynamic';

import { Preloader } from '@/components/ui/preloader';

const RegisterContainer = dynamic(
  () => import('@/components/auth/register-container').then((m) => m.RegisterContainer),
  { loading: () => <Preloader /> }
);

export default function RegisterPage() {
  return <RegisterContainer />;
}
