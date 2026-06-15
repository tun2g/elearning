import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ease-out-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white shadow-(--shadow-primary) hover:bg-primary-deep hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-card text-foreground border border-border-strong shadow-(--shadow-soft) hover:border-foreground hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'text-foreground hover:bg-muted',
  danger: 'bg-primary-soft text-primary-deep hover:bg-primary hover:text-white',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}
