import { Ear, Mic, Repeat2, Flame, BookOpenText, Headphones, Sparkles, LineChart, type LucideIcon } from 'lucide-react';

export interface Step {
  n: string;
  icon: LucideIcon;
  title: string;
  body: string;
}

export const steps: Step[] = [
  {
    n: '01',
    icon: Ear,
    title: 'Listen',
    body: 'Hear a real sentence the way a native speaker actually says it — rhythm, linking and all.',
  },
  {
    n: '02',
    icon: Mic,
    title: 'Shadow',
    body: 'Say it back out loud the instant you hear it. No reading ahead, no overthinking.',
  },
  {
    n: '03',
    icon: Repeat2,
    title: 'Repeat',
    body: 'Cards you find hard come back sooner. The ones you nail drift away. Effortless review.',
  },
];

export interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  accent: 'coral' | 'teal' | 'sun';
  span?: boolean;
}

export const features: Feature[] = [
  {
    icon: Headphones,
    title: 'Audio-first lessons',
    body: 'Every line leads with sound. You train your ear and mouth together, the way you learned your first language.',
    accent: 'coral',
    span: true,
  },
  {
    icon: BookOpenText,
    title: 'IPA + meaning',
    body: 'Phonetic transcription and a plain translation on every card — see exactly how a word should sound.',
    accent: 'teal',
  },
  {
    icon: Repeat2,
    title: 'Spaced repetition',
    body: 'A proven review schedule resurfaces vocabulary right before you would forget it.',
    accent: 'sun',
  },
  {
    icon: Flame,
    title: 'Streaks & XP',
    body: 'A daily goal, a growing streak and XP for every sentence keep the habit alive.',
    accent: 'coral',
  },
  {
    icon: LineChart,
    title: 'Progress you can feel',
    body: 'A home dashboard tracks completion, your longest streak and recent wins at a glance.',
    accent: 'teal',
    span: true,
  },
];

export interface Stat {
  value: string;
  label: string;
}

export const stats: Stat[] = [
  { value: '3 min', label: 'to your first spoken sentence' },
  { value: '1,200+', label: 'native-audio sentences' },
  { value: '12k', label: 'words reviewed daily' },
  { value: '4.9★', label: 'average learner rating' },
];

export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: 'I finally stopped translating in my head. Shadowing every day made speaking feel automatic.',
    name: 'Linh N.',
    detail: 'Marketing lead · Hanoi',
  },
  {
    quote: 'The streak is dangerously addictive. 64 days and my pronunciation is unrecognizable.',
    name: 'Daniel R.',
    detail: 'Software engineer · Berlin',
  },
  {
    quote: 'Ten minutes on the train each morning. The spaced review means nothing ever slips away.',
    name: 'Mai T.',
    detail: 'Medical student · Da Nang',
  },
  {
    quote: 'Other apps taught me to tap. Soundwell taught me to talk. Huge difference.',
    name: 'Priya S.',
    detail: 'Designer · Bangalore',
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: 'Do I need to be able to read English first?',
    a: 'No. Soundwell leads with audio, and every sentence carries IPA and a translation, so you can follow along from your very first session.',
  },
  {
    q: 'How is this different from other language apps?',
    a: 'Most apps drill tapping and matching. Soundwell is built around speaking out loud — listen, shadow, repeat — because production is what actually builds fluency.',
  },
  {
    q: 'How much time does it take per day?',
    a: 'A focused session is about ten minutes. Set a daily goal that fits your life and keep the streak alive — consistency beats marathon sessions.',
  },
  {
    q: 'Is there a mobile app?',
    a: 'Yes. Soundwell runs in your browser and as native iOS and Android apps, so your streak and review queue follow you everywhere.',
  },
  {
    q: 'How does the spaced repetition work?',
    a: 'After each card you mark it Again, Hard or Easy. Difficult words come back sooner and easy ones stretch further out, so you spend your time exactly where it matters.',
  },
];

export const methodPoints = [
  {
    icon: Ear,
    title: 'Input you can imitate',
    body: 'Comprehensible, native-paced audio — the raw material your brain turns into speech.',
  },
  {
    icon: Mic,
    title: 'Output from day one',
    body: 'You speak in the first minute, not the tenth lesson. Production is the whole point.',
  },
  {
    icon: Sparkles,
    title: 'Feedback that adjusts',
    body: 'Self-assessment steers your review queue so practice stays in your stretch zone.',
  },
];
