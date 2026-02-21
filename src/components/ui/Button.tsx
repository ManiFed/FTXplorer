'use client';

import { type ReactNode, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  primary: 'bg-accent-amber text-text-inverse hover:bg-accent-amber-bright font-medium',
  secondary: 'bg-bg-surface border border-border text-text-primary hover:bg-bg-surface-hover',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface',
  danger: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-body-sm',
  md: 'px-4 py-2 text-body',
  lg: 'px-6 py-3 text-body-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg
        transition-colors duration-150
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
