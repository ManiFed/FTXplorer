'use client';

import type { ConfidenceLevel } from '@/types';

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { color: string; label: string; description: string }> = {
  established: {
    color: 'var(--confidence-green)',
    label: 'Established',
    description: 'Established fact from court records or on-chain data',
  },
  disputed: {
    color: 'var(--confidence-yellow)',
    label: 'Disputed',
    description: 'Reported but disputed or contested',
  },
  alleged: {
    color: 'var(--confidence-red)',
    label: 'Alleged',
    description: 'Alleged or contested claim',
  },
};

interface ConfidenceDotProps {
  level: ConfidenceLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ConfidenceDot({ level, showLabel = false, size = 'md', className = '' }: ConfidenceDotProps) {
  const config = CONFIDENCE_CONFIG[level];
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} title={config.description}>
      <span
        className={`inline-block rounded-full ${sizeClasses[size]}`}
        style={{ backgroundColor: config.color }}
        role="img"
        aria-label={`${config.label}: ${config.description}`}
      />
      {showLabel && (
        <span className="text-caption text-text-secondary">{config.label}</span>
      )}
    </span>
  );
}

export function ConfidenceLegend() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <h4 className="text-body-sm font-semibold text-text-primary mb-1">Evidence Confidence</h4>
      {(Object.keys(CONFIDENCE_CONFIG) as ConfidenceLevel[]).map((level) => (
        <div key={level} className="flex items-center gap-2">
          <ConfidenceDot level={level} />
          <span className="text-body-sm text-text-secondary">
            <span className="font-medium text-text-primary">{CONFIDENCE_CONFIG[level].label}</span>
            {' — '}
            {CONFIDENCE_CONFIG[level].description}
          </span>
        </div>
      ))}
    </div>
  );
}
