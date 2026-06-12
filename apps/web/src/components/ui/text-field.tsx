import type { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, className, ...props }: TextFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
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
