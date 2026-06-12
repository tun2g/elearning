import { cn } from '@/lib/utils';

/** Soundwell mark — a rising sun whose rays are sound waves. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={cn('shrink-0', className)}>
      <rect width="40" height="40" rx="11" fill="var(--color-foreground)" />
      <line x1="8" y1="28" x2="32" y2="28" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M13 28a7 7 0 0 1 14 0" fill="var(--color-primary)" />
      <path d="M20 8.5a13 13 0 0 1 8.5 5" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 13a8.5 8.5 0 0 1 5.5 3.2" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className="h-8 w-8" />
      <span className="font-display text-xl font-semibold tracking-tight text-foreground">Soundwell</span>
    </span>
  );
}
