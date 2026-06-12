'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { ButtonLink } from '@/components/button';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/cn';
import { nav, site } from '@/lib/site';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div
        className={cn(
          'flex w-full max-w-6xl items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-all duration-300 sm:px-5',
          scrolled
            ? 'border border-border bg-card/80 shadow-[var(--shadow-soft)] backdrop-blur-xl'
            : 'border border-transparent bg-transparent'
        )}
      >
        <Link href="/" aria-label={site.name}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <ButtonLink href={site.links.signIn} variant="ghost" size="md">
            Sign in
          </ButtonLink>
          <ButtonLink href={site.links.start} size="md">
            Start free
          </ButtonLink>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-x-4 top-20 rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-lift)] md:hidden"
          >
            <nav className="flex flex-col">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <ButtonLink href={site.links.signIn} variant="secondary" className="w-full">
                Sign in
              </ButtonLink>
              <ButtonLink href={site.links.start} className="w-full">
                Start free
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
