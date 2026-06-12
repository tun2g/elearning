import { cn } from '@/lib/cn';
import { site } from '@/lib/site';

/** Soundwell mark — a rising sun whose rays are sound waves. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={cn('shrink-0', className)}>
      <rect width="40" height="40" rx="11" fill="var(--color-foreground)" />
      {/* horizon */}
      <line x1="8" y1="28" x2="32" y2="28" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round" />
      {/* sun */}
      <path d="M13 28a7 7 0 0 1 14 0" fill="var(--color-primary)" />
      {/* sound rays */}
      <path d="M20 8.5a13 13 0 0 1 8.5 5" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 13a8.5 8.5 0 0 1 5.5 3.2" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className="h-9 w-9" />
      <span className="font-display text-[1.35rem] font-semibold tracking-tight text-foreground">{site.name}</span>
    </span>
  );
}
