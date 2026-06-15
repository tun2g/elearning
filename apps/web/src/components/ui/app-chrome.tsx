'use client';

import { House, Library, Layers, Trophy } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { NotificationBell } from '@/components/notifications/notification-bell';
import { Logo, LogoMark } from '@/components/ui/logo';
import { UserMenu } from '@/components/user/user-menu';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/home', label: 'Home', icon: House },
  { href: '/lessons', label: 'Lessons', icon: Library },
  { href: '/vocab', label: 'Vocab', icon: Layers },
  { href: '/leaderboard', label: 'Ranks', icon: Trophy },
] as const;

const BARE_ROUTES = ['/login', '/register'];

function useActive(pathname: string) {
  return (href: string) => (href === '/home' ? pathname === '/home' : pathname.startsWith(href));
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = useActive(pathname);

  if (BARE_ROUTES.some((r) => pathname.startsWith(r))) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/home" aria-label="Soundwell home">
            <Logo className="hidden sm:inline-flex" />
            <LogoMark className="h-9 w-9 sm:hidden" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive(t.href)
                    ? 'bg-primary-soft text-primary-deep'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <t.icon size={17} />
                {t.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="pb-24 md:pb-0">{children}</div>

      {/* Bottom tab bar (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
          {TABS.map((t) => {
            const active = isActive(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[0.7rem] font-medium transition-colors',
                  active ? 'text-primary-deep' : 'text-subtle'
                )}
              >
                <span
                  className={cn(
                    'grid h-9 w-14 place-items-center rounded-full transition-colors',
                    active && 'bg-primary-soft'
                  )}
                >
                  <t.icon size={20} />
                </span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
