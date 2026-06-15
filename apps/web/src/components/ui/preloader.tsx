import { Waveform } from '@/components/ui/waveform';
import { cn } from '@/lib/utils';

/** Full-height animated loading fallback for lazily-loaded route containers. */
export function Preloader({ text = 'Loading…', className }: { text?: string; className?: string }) {
  return (
    <main className={cn('mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5', className)}>
      <Waveform className="h-8 w-32 text-primary/50" />
      <p className="mt-4 text-sm text-muted-foreground">{text}</p>
    </main>
  );
}
