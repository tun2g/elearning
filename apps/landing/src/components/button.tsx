import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white shadow-[var(--shadow-primary)] hover:bg-primary-deep hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-card text-foreground border border-border-strong shadow-[var(--shadow-soft)] hover:border-foreground hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'text-foreground hover:bg-muted',
};

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-8 text-base',
};

type ButtonAsLink = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, 'href' | 'className'>;

export function ButtonLink({ href, variant = 'primary', size = 'md', className, children, ...props }: ButtonAsLink) {
  const external = href.startsWith('http') || href.startsWith('#');
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...(external && href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
    </Link>
  );
}
