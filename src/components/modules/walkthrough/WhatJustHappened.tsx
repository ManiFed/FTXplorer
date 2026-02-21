'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfidenceDot } from '@/components/ui/ConfidenceDot';
import type { KeyFact } from '@/types';

interface WhatJustHappenedProps {
  facts: KeyFact[];
  chapterTitle: string;
}

export function WhatJustHappened({ facts, chapterTitle }: WhatJustHappenedProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed left-shell-sidebar top-28 w-72 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-body-sm font-semibold text-text-secondary hover:text-text-primary transition-colors mb-2"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}
        >
          <path d="M4 2l4 4-4 4" />
        </svg>
        What Just Happened
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-bg-secondary/80 backdrop-blur-sm border border-border rounded-lg p-3 overflow-hidden"
          >
            <h4 className="text-caption font-semibold text-accent-amber mb-2 truncate">
              {chapterTitle}
            </h4>
            <ul className="space-y-2">
              {facts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2 text-body-sm text-text-secondary">
                  <ConfidenceDot level={fact.confidenceLevel} size="sm" className="mt-1.5 flex-shrink-0" />
                  <span>{fact.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
