'use client';

import { cn } from '@/lib/utils';

const HEIGHTS = [0.4, 0.7, 1, 0.55, 0.85, 0.35, 0.95, 0.6, 0.45, 0.8, 0.5, 0.9, 0.4, 0.7, 0.3, 0.65];

/** Decorative animated audio bars. `playing` controls motion. */
export function Waveform({
  className,
  playing = true,
  bars = HEIGHTS.length,
}: {
  className?: string;
  playing?: boolean;
  bars?: number;
}) {
  return (
    <div className={cn('flex items-center gap-[3px]', className)} aria-hidden="true">
      {HEIGHTS.slice(0, bars).map((h, i) => (
        <span
          key={i}
          className="w-[3px] origin-center rounded-full bg-current"
          style={{
            height: `${Math.round(h * 100)}%`,
            animation: playing ? `bar ${0.9 + (i % 5) * 0.18}s ease-in-out ${i * 0.06}s infinite` : 'none',
            transform: playing ? undefined : `scaleY(${h})`,
          }}
        />
      ))}
    </div>
  );
}
