'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NarrativeBlock } from './NarrativeBlock';
import { PrimarySourceCallout } from './PrimarySourceCallout';
import { AutoAnimatedChart } from './AutoAnimatedChart';
import { DecisionFork } from './DecisionFork';
import { WhatJustHappened } from './WhatJustHappened';
import { useAppStore, useWalkthroughStore } from '@/lib/store';
import type { Chapter } from '@/types';

interface ChapterRendererProps {
  chapter: Chapter;
}

export function ChapterRenderer({ chapter }: ChapterRendererProps) {
  const { setViewDate } = useAppStore();
  const {
    decisions,
    makeDecision,
    forkRevealed,
    setForkRevealed,
    markChapterComplete,
    setCurrentChapter,
  } = useWalkthroughStore();

  const selectedOptionId = decisions[chapter.number];

  // Sync the global timeline scrubber with this chapter's date range
  useEffect(() => {
    setViewDate(new Date(chapter.dateRange.start));
  }, [chapter.dateRange.start, setViewDate]);

  const handleDecisionMade = (optionId: string) => {
    makeDecision(chapter.number, optionId);
  };

  const handleReveal = () => {
    setForkRevealed(true);
  };

  const handleContinue = () => {
    markChapterComplete(chapter.number);
    setCurrentChapter(chapter.number + 1);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={chapter.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen"
      >
        {/* Chapter header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-3xl mx-auto pt-12 pb-8 px-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-caption font-semibold text-accent-amber uppercase tracking-widest">
              Chapter {chapter.number}
            </span>
            <span className="text-caption text-text-muted">
              {new Date(chapter.dateRange.start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              {chapter.dateRange.end !== chapter.dateRange.start && (
                <> — {new Date(chapter.dateRange.end).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</>
              )}
            </span>
          </div>
          <h2 className="text-display font-bold text-text-primary mb-2">
            {chapter.title}
          </h2>
          <p className="text-body-lg text-text-secondary">
            {chapter.subtitle}
          </p>
        </motion.div>

        {/* What Just Happened sidebar */}
        <WhatJustHappened facts={chapter.keyFacts} chapterTitle={chapter.title} />

        {/* Main content area */}
        <div className="max-w-3xl mx-auto px-6 pb-12">
          {/* Narrative */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <NarrativeBlock content={chapter.narrative} />
          </motion.div>

          {/* Primary sources */}
          {chapter.primarySources.map((source, i) => (
            <PrimarySourceCallout key={i} source={source} />
          ))}

          {/* Chart */}
          {chapter.chartConfig && (
            <AutoAnimatedChart config={chapter.chartConfig} />
          )}

          {/* Decision fork */}
          {chapter.decisionFork && (
            <DecisionFork
              fork={chapter.decisionFork}
              onDecisionMade={handleDecisionMade}
              onReveal={handleReveal}
              onContinue={handleContinue}
              selectedOptionId={selectedOptionId}
              revealed={forkRevealed}
            />
          )}

          {/* If no decision fork, show continue button */}
          {!chapter.decisionFork && (
            <div className="text-center mt-12">
              <button
                onClick={handleContinue}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-amber text-text-inverse font-medium hover:bg-accent-amber-bright transition-colors"
              >
                Continue to next chapter
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
