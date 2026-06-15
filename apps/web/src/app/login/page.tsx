import dynamic from 'next/dynamic';

import { Preloader } from '@/components/ui/preloader';

const LoginContainer = dynamic(() => import('@/components/auth/login-container').then((m) => m.LoginContainer), {
  loading: () => <Preloader />,
});

export default function LoginPage() {
  return <LoginContainer />;
}
