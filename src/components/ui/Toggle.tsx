'use client';

interface ToggleOption<T extends string> {
  value: T;
  label: string;
}

interface ToggleProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function Toggle<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}: ToggleProps<T>) {
  const sizeClasses = size === 'sm' ? 'text-caption px-2 py-1' : 'text-body-sm px-3 py-1.5';

  return (
    <div className={`inline-flex rounded-lg bg-bg-tertiary p-0.5 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`
            ${sizeClasses} rounded-md transition-all duration-150 font-medium
            ${
              value === option.value
                ? 'bg-bg-surface text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }
          `}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
