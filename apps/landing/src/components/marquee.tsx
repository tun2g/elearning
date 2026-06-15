const PHRASES = [
  'Listen',
  'Shadow',
  'Speak',
  'Repeat',
  'Build a streak',
  'Sound native',
  'Review smarter',
  'Stay consistent',
];

function Track({ ariaHidden = false }: { ariaHidden?: boolean }) {
  const items = [...PHRASES, ...PHRASES];
  return (
    <div
      aria-hidden={ariaHidden}
      className="flex shrink-0 animate-[marquee_34s_linear_infinite] items-center gap-10 pr-10"
    >
      {items.map((p, i) => (
        <span key={i} className="flex items-center gap-10">
          <span className="font-display text-2xl font-medium text-muted-foreground">{p}</span>
          <span className="h-2 w-2 rounded-full bg-primary" />
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-2">
      <div className="relative flex overflow-hidden rounded-full border border-border bg-card/70 py-4">
        {/* edge fades so the text dissolves into the band instead of hard-clipping */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-linear-to-r from-card to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-linear-to-l from-card to-transparent" />
        <Track />
        <Track ariaHidden />
      </div>
    </div>
  );
}
