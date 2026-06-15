'use client';

import { LogOut, Moon, Settings, Sun } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

import { useMe } from '@/hooks/use-me';
import { getAccessToken, logout } from '@/lib/auth';
import { cn } from '@/lib/utils';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

const ITEM = 'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted';

export function UserMenu() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Resolve the token only after mount so SSR and the first client render agree.
  const hasToken = mounted && Boolean(getAccessToken());
  const { data: me } = useMe({ enabled: hasToken });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!mounted || !hasToken) return null;

  const isDark = resolvedTheme === 'dark';
  const name = me?.displayName ?? '';

  const signOut = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        data-tour="settings"
        aria-label="Account menu"
        className="grid h-9 w-9 place-items-center overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-primary-soft focus-visible:outline-none focus-visible:ring-primary"
      >
        {me?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={me.avatarUrl} alt={name} className="h-9 w-9 object-cover" />
        ) : (
          <span className="grid h-9 w-9 place-items-center bg-primary-soft text-sm font-semibold text-primary-deep">
            {name ? initials(name) : '🙂'}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-lift)">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            {me?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.avatarUrl} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary-deep">
                {name ? initials(name) : '🙂'}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{name || 'Your account'}</p>
              {me?.email && <p className="truncate text-xs text-muted-foreground">{me.email}</p>}
            </div>
          </div>

          <div className="py-1">
            <Link href="/settings" onClick={() => setOpen(false)} className={ITEM}>
              <Settings size={16} className="text-muted-foreground" />
              Settings
            </Link>
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={ITEM}>
              {isDark ? (
                <Sun size={16} className="text-muted-foreground" />
              ) : (
                <Moon size={16} className="text-muted-foreground" />
              )}
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>
          </div>

          <div className="border-t border-border py-1">
            <button onClick={signOut} className={cn(ITEM, 'text-primary-deep')}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
