import { Cta } from '@/components/cta';
import { Faq } from '@/components/faq';
import { Features } from '@/components/features';
import { Hero } from '@/components/hero';
import { HowItWorks } from '@/components/how-it-works';
import { Marquee } from '@/components/marquee';
import { Method } from '@/components/method';
import { Platforms } from '@/components/platforms';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Stats } from '@/components/stats';
import { Testimonials } from '@/components/testimonials';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Marquee />
        <HowItWorks />
        <Method />
        <Features />
        <Stats />
        <Testimonials />
        <Platforms />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </>
  );
}
