import Link from 'next/link';

import { Logo } from '@/components/logo';
import { nav, site } from '@/lib/site';

const columns = [
  {
    title: 'Product',
    links: nav.map((n) => ({ label: n.label, href: n.href })),
  },
  {
    title: 'Get started',
    links: [
      { label: 'Create account', href: site.links.start },
      { label: 'Sign in', href: site.links.signIn },
      { label: 'Browse lessons', href: site.links.lessons },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The speaking-first way to learn English. Listen, shadow, speak — a little every day.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary-deep"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-subtle sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. Speak with confidence.
          </p>
          <p className="font-display italic">Listen · Shadow · Speak</p>
        </div>
      </div>
    </footer>
  );
}
