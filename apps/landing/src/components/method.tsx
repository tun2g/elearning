import { PracticeDemo } from '@/components/practice-demo';
import { Reveal, RevealGroup, RevealItem } from '@/components/reveal';
import { methodPoints } from '@/lib/content';

export function Method() {
  return (
    <section id="method" className="relative overflow-hidden border-y border-border bg-card/50 py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              The method
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="text-balance mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Built on how fluency actually forms
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              You didn&apos;t learn to talk by memorizing rules. Soundwell recreates the input-then-output loop that
              wires speech into muscle memory.
            </p>
          </Reveal>

          <RevealGroup className="mt-10 flex flex-col gap-5">
            {methodPoints.map((p) => (
              <RevealItem key={p.title} className="flex gap-4 rounded-2xl p-1">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-foreground text-accent">
                  <p.icon size={20} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-1 text-muted-foreground">{p.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <Reveal delay={0.1}>
          <PracticeDemo />
        </Reveal>
      </div>
    </section>
  );
}
