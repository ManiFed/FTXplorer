'use client';

import { useWalkthroughStore } from '@/lib/store';

interface ChapterProgressProps {
  totalChapters: number;
}

export function ChapterProgress({ totalChapters }: ChapterProgressProps) {
  const { currentChapter, completedChapters, setCurrentChapter } = useWalkthroughStore();

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1">
      {Array.from({ length: totalChapters }, (_, i) => i + 1).map((num) => {
        const isActive = num === currentChapter;
        const isCompleted = completedChapters.has(num);

        return (
          <button
            key={num}
            onClick={() => setCurrentChapter(num)}
            className={`
              group relative w-3 h-3 rounded-full border transition-all duration-200
              ${isActive
                ? 'bg-accent-amber border-accent-amber scale-125'
                : isCompleted
                  ? 'bg-accent-amber/40 border-accent-amber/40'
                  : 'bg-transparent border-border hover:border-text-muted'
              }
            `}
            aria-label={`Go to chapter ${num}`}
          >
            {/* Tooltip */}
            <span className="absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-caption bg-bg-surface text-text-secondary px-2 py-1 rounded border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Chapter {num}
            </span>
          </button>
        );
      })}
    </div>
  );
}
