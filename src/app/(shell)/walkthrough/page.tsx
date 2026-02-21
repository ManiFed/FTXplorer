'use client';

import { useMemo } from 'react';
import { useWalkthroughStore } from '@/lib/store';
import { ChapterRenderer } from '@/components/modules/walkthrough/ChapterRenderer';
import { ChapterProgress } from '@/components/modules/walkthrough/ChapterProgress';
import { WalkthroughSummary } from '@/components/modules/walkthrough/WalkthroughSummary';
import chaptersData from '../../../../public/data/chapters.json';
import type { Chapter } from '@/types';

export default function WalkthroughPage() {
  const { currentChapter, walkthroughComplete } = useWalkthroughStore();

  const chapters = chaptersData as Chapter[];
  const totalChapters = chapters.length;

  const chapter = useMemo(() => {
    return chapters.find((ch) => ch.number === currentChapter);
  }, [chapters, currentChapter]);

  if (walkthroughComplete || currentChapter > totalChapters) {
    return <WalkthroughSummary />;
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-text-muted">Loading chapter...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <ChapterProgress totalChapters={totalChapters} />
      <ChapterRenderer chapter={chapter} totalChapters={totalChapters} />
    </div>
  );
}
