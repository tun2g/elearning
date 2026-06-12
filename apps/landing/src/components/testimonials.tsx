import { Quote } from 'lucide-react';

import { RevealGroup, RevealItem } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { testimonials } from '@/lib/content';

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:py-28">
      <SectionHeading
        eyebrow="Loved by learners"
        title="From “I freeze up” to “I just talk”"
        subtitle="Real people who traded passive study for speaking out loud — every single day."
      />

      <RevealGroup className="mt-16 columns-1 gap-5 sm:columns-2 lg:columns-2 [&>*]:mb-5" stagger={0.08}>
        {testimonials.map((t) => (
          <RevealItem key={t.name} className="break-inside-avoid">
            <figure className="rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-soft)]">
              <Quote size={28} className="text-primary/40" aria-hidden="true" />
              <blockquote className="mt-4 font-display text-xl leading-relaxed text-foreground">“{t.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-foreground font-display text-sm font-semibold text-accent">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-subtle">{t.detail}</p>
                </div>
              </figcaption>
            </figure>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
