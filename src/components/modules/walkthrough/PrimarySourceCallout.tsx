'use client';

import { motion } from 'framer-motion';
import type { PrimarySource } from '@/types';

const TYPE_CONFIG = {
  tweet: { label: 'Tweet', icon: '𝕏', accentClass: 'border-blue-500/30' },
  signal: { label: 'Signal Message', icon: '💬', accentClass: 'border-green-500/30' },
  document: { label: 'Document', icon: '📄', accentClass: 'border-text-muted/30' },
  article: { label: 'News Article', icon: '📰', accentClass: 'border-accent-amber/30' },
  'court-filing': { label: 'Court Filing', icon: '⚖️', accentClass: 'border-confidence-yellow/30' },
};

interface PrimarySourceCalloutProps {
  source: PrimarySource;
}

export function PrimarySourceCallout({ source }: PrimarySourceCalloutProps) {
  const config = TYPE_CONFIG[source.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`
        bg-bg-tertiary border-l-2 ${config.accentClass}
        rounded-r-lg p-4 my-6 max-w-2xl
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{config.icon}</span>
        <span className="text-caption font-medium text-text-muted uppercase tracking-wider">
          {config.label}
        </span>
        {source.author && (
          <span className="text-caption text-text-secondary">— {source.author}</span>
        )}
        <span className="text-caption text-text-muted ml-auto">
          {new Date(source.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Content */}
      <blockquote className="text-body text-text-primary/90 font-narrative italic leading-relaxed">
        &ldquo;{source.content}&rdquo;
      </blockquote>

      {/* Attribution */}
      <div className="mt-2 text-caption text-text-muted">
        {source.attribution}
      </div>
    </motion.div>
  );
}
