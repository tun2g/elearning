import type { InputHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Optional accessory shown right-aligned on the label row (e.g. "Forgot password?"). */
  labelRight?: ReactNode;
}

export function TextField({ label, error, labelRight, className, ...props }: TextFieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-foreground">{label}</label>
        {labelRight}
      </div>
      <input
        className={cn(
          'w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-primary/25',
          error ? 'border-primary' : 'border-border-strong',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-primary-deep">{error}</p>}
    </div>
  );
}
