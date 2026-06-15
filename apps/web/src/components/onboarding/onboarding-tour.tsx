'use client';

import { useTour } from '@reactour/tour';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { getAccessToken } from '@/lib/auth';

export const ONBOARDED_KEY = 'sw_onboarded';

/**
 * Auto-starts the product tour the first time a signed-in user lands on Home.
 * Marks the flag immediately so it never re-opens on its own; replaying is an
 * explicit action from Settings. Renders nothing.
 */
export function OnboardingTour() {
  const { setIsOpen } = useTour();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname !== '/home' || !getAccessToken()) return;
    if (localStorage.getItem(ONBOARDED_KEY)) return;

    localStorage.setItem(ONBOARDED_KEY, '1');
    // Let Home content mount so the [data-tour] targets are measurable.
    const timer = setTimeout(() => setIsOpen(true), 600);
    return () => clearTimeout(timer);
  }, [pathname, setIsOpen]);

  return null;
}
