import type { Metadata, Viewport } from 'next';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';

import { AppChrome } from '@/components/app-chrome';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';

import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f9fc' },
    { media: '(prefers-color-scheme: dark)', color: '#080e1c' },
  ],
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  title: 'Soundwell — Practice English by Sound',
  description: 'Listen, shadow, and speak your way to fluent English.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <QueryProvider>
            <AppChrome>{children}</AppChrome>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
