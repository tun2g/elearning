/**
 * Single source of truth for site-wide strings, URLs and nav.
 * All env access goes through here; never read process.env elsewhere.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';

export const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const site = {
  name: 'Soundwell',
  tagline: 'Speak English with confidence',
  description:
    'Soundwell is a speaking-first English course. Listen to native lines, shadow them out loud, and build a daily streak — with spaced-repetition vocabulary and instant pronunciation feedback.',
  url: siteUrl,
  appUrl,
  locale: 'en_US',
  links: {
    start: `${appUrl}/register`,
    signIn: `${appUrl}/login`,
    lessons: `${appUrl}/lessons`,
    appStore: '#',
    playStore: '#',
    github: '#',
  },
} as const;

export const nav = [
  { label: 'How it works', href: '#how' },
  { label: 'Features', href: '#features' },
  { label: 'Method', href: '#method' },
  { label: 'Apps', href: '#apps' },
  { label: 'FAQ', href: '#faq' },
] as const;
