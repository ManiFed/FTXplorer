'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { DecisionFork as DecisionForkType } from '@/types';

interface DecisionForkProps {
  fork: DecisionForkType;
  onDecisionMade: (optionId: string) => void;
  onReveal: () => void;
  onContinue: () => void;
  selectedOptionId?: string;
  revealed: boolean;
}

export function DecisionFork({
  fork,
  onDecisionMade,
  onReveal,
  onContinue,
  selectedOptionId,
  revealed,
}: DecisionForkProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const selectedOption = fork.options.find((o) => o.id === selectedOptionId);
  const actualOption = fork.options.find((o) => o.isActual);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto my-12"
    >
      {/* Fork header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="h-px w-12 bg-accent-amber/40" />
          <span className="text-caption font-semibold text-accent-amber uppercase tracking-widest">
            Decision Point
          </span>
          <div className="h-px w-12 bg-accent-amber/40" />
        </div>
        <h3 className="text-heading-2 font-bold text-text-primary font-serif">
          {fork.prompt}
        </h3>
        <p className="text-body text-text-secondary mt-3 max-w-xl mx-auto">
          {fork.context}
        </p>
      </div>

      {/* Options */}
      {!selectedOptionId && (
        <div className="grid gap-3">
          {fork.options.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onDecisionMade(option.id)}
              onMouseEnter={() => setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              className={`
                text-left p-4 rounded-lg border transition-all duration-200
                ${hoveredOption === option.id
                  ? 'bg-accent-amber/10 border-accent-amber/40 text-text-primary'
                  : 'bg-bg-surface border-border text-text-secondary hover:text-text-primary'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-bg-tertiary border border-border flex items-center justify-center text-body-sm font-bold text-text-muted">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-body font-medium pt-1">{option.label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Selected option — show consequence */}
      <AnimatePresence>
        {selectedOption && !revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <div className="bg-bg-surface border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-caption font-semibold text-accent-amber uppercase tracking-wider">
                  Your choice
                </span>
                <span className="text-body-sm font-medium text-text-primary">
                  {selectedOption.label}
                </span>
              </div>
              <p className="text-body text-text-secondary font-narrative leading-relaxed">
                {selectedOption.consequence}
              </p>
            </div>

            <div className="text-center mt-6">
              <Button variant="primary" onClick={onReveal}>
                What actually happened?
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revealed: what actually happened */}
      <AnimatePresence>
        {revealed && actualOption && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            {/* User's choice (condensed) */}
            {selectedOption && selectedOption.id !== actualOption.id && (
              <div className="bg-bg-surface/50 border border-border rounded-lg p-4 opacity-60">
                <span className="text-caption text-text-muted">You chose: </span>
                <span className="text-body-sm text-text-secondary">{selectedOption.label}</span>
              </div>
            )}

            {/* What actually happened */}
            <div className="bg-accent-amber/5 border border-accent-amber/20 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-caption font-semibold text-accent-amber uppercase tracking-wider">
                  What actually happened
                </span>
              </div>
              <p className="text-body font-medium text-text-primary mb-2">
                {actualOption.label}
              </p>
              <p className="text-body text-text-secondary font-narrative leading-relaxed">
                {actualOption.consequence}
              </p>
            </div>

            <div className="text-center mt-8">
              <Button variant="primary" onClick={onContinue}>
                Continue to next chapter
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
