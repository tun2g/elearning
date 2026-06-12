import { RevealGroup, RevealItem } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { steps } from '@/lib/content';

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-24 sm:py-28">
      <SectionHeading
        eyebrow="How it works"
        title="Three steps. One loop. Real speech."
        subtitle="No grammar drills or matching games — just the natural cycle your brain already uses to learn a language."
      />

      <RevealGroup className="relative mt-16 grid gap-6 md:grid-cols-3">
        {/* connecting line */}
        <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border-strong to-transparent md:block" />

        {steps.map((s) => (
          <RevealItem
            key={s.n}
            className="group relative rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-foreground text-accent transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                <s.icon size={24} />
              </span>
              <span className="font-display text-5xl font-semibold text-muted transition-colors duration-300 group-hover:text-primary-soft">
                {s.n}
              </span>
            </div>
            <h3 className="mt-6 font-display text-2xl font-semibold text-foreground">{s.title}</h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
