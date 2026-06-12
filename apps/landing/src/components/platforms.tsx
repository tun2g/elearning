import { Apple, Globe, Play, Smartphone } from 'lucide-react';

import { ButtonLink } from '@/components/button';
import { Reveal } from '@/components/reveal';
import { Waveform } from '@/components/waveform';
import { site } from '@/lib/site';

function StoreBadge({ href, icon, top, bottom }: { href: string; icon: React.ReactNode; top: string; bottom: string }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-3 rounded-2xl bg-foreground px-5 py-3 text-card transition-transform hover:-translate-y-0.5"
    >
      <span className="text-accent">{icon}</span>
      <span className="text-left leading-tight">
        <span className="block text-[0.65rem] uppercase tracking-wide text-card/60">{top}</span>
        <span className="block font-semibold">{bottom}</span>
      </span>
    </a>
  );
}

export function Platforms() {
  return (
    <section id="apps" className="mx-auto max-w-6xl px-5 py-12">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-foreground px-7 py-12 text-card sm:px-12 sm:py-14">
          {/* warm glow */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-card/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
                <Smartphone size={13} /> Web · iOS · Android
              </span>
              <h2 className="text-balance mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                Your streak follows you everywhere
              </h2>
              <p className="mt-4 max-w-md text-lg text-card/70">
                Start a lesson on the train, finish it at your desk. Progress, streaks and your review queue sync across
                every device.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <StoreBadge
                  href={site.links.appStore}
                  icon={<Apple size={24} />}
                  top="Download on the"
                  bottom="App Store"
                />
                <StoreBadge
                  href={site.links.playStore}
                  icon={<Play size={22} className="fill-current" />}
                  top="Get it on"
                  bottom="Google Play"
                />
              </div>
              <div className="mt-4">
                <ButtonLink
                  href={site.links.lessons}
                  variant="ghost"
                  className="px-0 text-accent hover:bg-transparent hover:text-accent-soft"
                >
                  <Globe size={16} /> Or just open it in your browser
                </ButtonLink>
              </div>
            </div>

            {/* phone mock */}
            <div className="relative mx-auto hidden w-60 lg:block">
              <div className="rounded-[2.5rem] border-4 border-card/15 bg-background p-3 shadow-2xl">
                <div className="rounded-[1.8rem] bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">9:41</span>
                    <span className="text-xs text-primary">🔥 12</span>
                  </div>
                  <div className="mt-4 grid h-12 w-12 place-items-center rounded-full bg-primary text-white">
                    <Play size={18} className="fill-current" />
                  </div>
                  <Waveform className="mt-4 h-8 text-primary" bars={12} />
                  <p className="mt-4 font-display text-base font-medium text-foreground">“See you tomorrow!”</p>
                  <p className="mt-1 font-mono text-[0.7rem] text-secondary-deep">/siː juː təˈmɒrəʊ/</p>
                  <div className="mt-4 flex gap-1.5">
                    <span className="flex-1 rounded-full bg-primary-soft py-1.5 text-center text-[0.6rem] font-semibold text-primary-deep">
                      Again
                    </span>
                    <span className="flex-1 rounded-full bg-accent-soft py-1.5 text-center text-[0.6rem] font-semibold text-accent-deep">
                      Hard
                    </span>
                    <span className="flex-1 rounded-full bg-secondary-soft py-1.5 text-center text-[0.6rem] font-semibold text-secondary-deep">
                      Easy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
