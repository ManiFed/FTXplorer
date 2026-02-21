'use client';

import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hover?: boolean;
}

const variantClasses = {
  default: 'bg-bg-surface border border-border',
  elevated: 'bg-bg-surface border border-border shadow-lg shadow-black/20',
  outlined: 'bg-transparent border border-border',
  glass: 'glass',
};

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
  hover = false,
}: CardProps) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      className={`
        rounded-lg ${variantClasses[variant]} ${paddingClasses[padding]}
        ${hover || onClick ? 'transition-colors hover:bg-bg-surface-hover cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}
