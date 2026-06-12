'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Reveal } from '@/components/reveal';
import { useLesson } from '@/features/lessons/api';

import { PracticeClient } from './practice-client';

export default function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    data: lesson,
    isLoading,
    isError,
  } = useLesson({
    variables: { slug },
  });

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <Link
        href="/lessons"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} /> All lessons
      </Link>

      {isLoading && (
        <div className="mt-6 flex flex-col gap-3">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded-lg bg-muted" />
          <div className="mt-4 h-24 animate-pulse rounded-3xl border border-border bg-card" />
        </div>
      )}

      {isError && (
        <div className="mt-10 rounded-3xl border border-border bg-card p-8 text-center">
          <p className="font-display text-lg font-semibold text-foreground">Lesson not found</p>
          <p className="mt-1 text-sm text-muted-foreground">It may have been moved or removed.</p>
        </div>
      )}

      {lesson && (
        <>
          <Reveal>
            <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-foreground">{lesson.title}</h1>
            {lesson.description && <p className="mt-1.5 text-muted-foreground">{lesson.description}</p>}
          </Reveal>
          <PracticeClient lesson={lesson} />
        </>
      )}
    </main>
  );
}
