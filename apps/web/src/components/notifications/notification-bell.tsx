'use client';

import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useSyncNotifications,
} from '@/hooks/use-notifications';
import { getAccessToken } from '@/lib/auth';
import { cn } from '@/lib/utils';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function NotificationBell() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Resolve the token only after mount so SSR and the first client render agree.
  const hasToken = mounted && Boolean(getAccessToken());
  const { data } = useNotifications({ enabled: hasToken });
  const sync = useSyncNotifications();
  const { mutate: markRead } = useMarkNotificationRead({ onSuccess: sync });
  const { mutate: markAll } = useMarkAllNotificationsRead({ onSuccess: sync });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!mounted || !hasToken) return null;

  const unread = data?.unreadCount ?? 0;
  const items = data?.notifications ?? [];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative inline-flex items-center rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-(--shadow-lift)">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unread > 0 && (
              <button onClick={() => markAll()} className="text-xs font-medium text-primary-deep hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.readAt) markRead(n.id);
                  }}
                  className={cn(
                    'flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted',
                    !n.readAt && 'bg-primary-soft/40'
                  )}
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-medium text-foreground">
                    {n.title}
                    {!n.readAt && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </span>
                  <span className="text-xs text-muted-foreground">{n.body}</span>
                  <span className="text-[11px] text-subtle">{timeAgo(n.createdAt)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
