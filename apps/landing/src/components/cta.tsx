import { ArrowRight } from 'lucide-react';

import { ButtonLink } from '@/components/button';
import { Reveal } from '@/components/reveal';
import { Waveform } from '@/components/waveform';
import { site } from '@/lib/site';

export function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-linear-to-br from-primary via-primary to-primary-deep px-6 py-16 text-center shadow-(--shadow-lift) sm:px-12 sm:py-20">
          <Waveform className="absolute inset-x-0 top-8 mx-auto h-10 w-40 text-white/30" bars={28} />
          <div className="pointer-events-none absolute -bottom-16 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-accent/40 blur-3xl" />

          <div className="relative">
            <h2 className="text-balance mx-auto max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Your first sentence is three minutes away
            </h2>
            <p className="text-balance mx-auto mt-5 max-w-xl text-lg text-white/85">
              Free to start. No card required. Just press play and speak.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink
                href={site.links.start}
                variant="secondary"
                size="lg"
                className="border-transparent bg-white text-primary-deep hover:bg-card"
              >
                Start free
                <ArrowRight size={18} />
              </ButtonLink>
              <ButtonLink href={site.links.lessons} variant="ghost" size="lg" className="text-white hover:bg-white/10">
                Browse lessons
              </ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
