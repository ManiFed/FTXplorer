'use client';

import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'amber' | 'green' | 'yellow' | 'red' | 'modeled';
  className?: string;
}

const variantClasses = {
  default: 'bg-bg-surface text-text-secondary border border-border',
  amber: 'bg-accent-amber/10 text-accent-amber border border-accent-amber/30',
  green: 'bg-confidence-green/10 text-confidence-green border border-confidence-green/30',
  yellow: 'bg-confidence-yellow/10 text-confidence-yellow border border-confidence-yellow/30',
  red: 'bg-confidence-red/10 text-confidence-red border border-confidence-red/30',
  modeled: 'bg-accent-amber/10 text-accent-amber border border-accent-amber/30 uppercase tracking-wider',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-caption font-medium
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
