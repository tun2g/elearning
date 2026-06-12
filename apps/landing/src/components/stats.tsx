import { RevealGroup, RevealItem } from '@/components/reveal';
import { stats } from '@/lib/content';

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <RevealGroup className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border lg:grid-cols-4">
        {stats.map((s) => (
          <RevealItem key={s.label} className="bg-card">
            <div className="flex h-full flex-col items-center justify-center gap-1.5 px-4 py-8 text-center">
              <span className="font-display text-4xl font-semibold tracking-tight text-primary-deep sm:text-5xl">
                {s.value}
              </span>
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
