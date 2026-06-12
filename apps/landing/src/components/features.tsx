import { RevealGroup, RevealItem } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { Waveform } from '@/components/waveform';
import { features } from '@/lib/content';
import { cn } from '@/lib/cn';

const accentBg = {
  coral: 'bg-primary-soft text-primary-deep',
  teal: 'bg-secondary-soft text-secondary-deep',
  sun: 'bg-accent-soft text-accent-deep',
} as const;

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-24 sm:py-28">
      <SectionHeading
        eyebrow="Everything you need"
        title="A whole speaking gym in your pocket"
        subtitle="Purpose-built tools that keep you talking, remembering, and coming back every day."
      />

      <RevealGroup className="mt-16 grid auto-rows-[minmax(0,1fr)] gap-5 md:grid-cols-3" stagger={0.07}>
        {features.map((f) => (
          <RevealItem key={f.title} className={cn(f.span && 'md:col-span-2', 'h-full')}>
            <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <div>
                <span className={cn('inline-grid h-12 w-12 place-items-center rounded-2xl', accentBg[f.accent])}>
                  <f.icon size={22} />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">{f.body}</p>
              </div>

              {f.span && f.accent === 'coral' && <Waveform className="mt-6 h-12 w-full text-primary/70" bars={40} />}
              {f.span && f.accent === 'teal' && (
                <div className="mt-6 flex items-end gap-1.5">
                  {[40, 65, 50, 80, 70, 95, 60, 88].map((h, i) => (
                    <span key={i} className="flex-1 rounded-t-md bg-secondary/70" style={{ height: `${h * 0.5}px` }} />
                  ))}
                </div>
              )}
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
