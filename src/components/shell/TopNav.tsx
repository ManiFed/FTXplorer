'use client';

import { useAppStore } from '@/lib/store';
import { Toggle } from '@/components/ui/Toggle';
import type { ComplexityMode, ViewMode } from '@/types';

const complexityOptions = [
  { value: 'beginner' as ComplexityMode, label: 'Beginner' },
  { value: 'researcher' as ComplexityMode, label: 'Researcher' },
  { value: 'expert' as ComplexityMode, label: 'Expert' },
];

const viewModeOptions = [
  { value: 'play' as ViewMode, label: 'Play' },
  { value: 'explore' as ViewMode, label: 'Explore' },
];

export function TopNav() {
  const { complexityMode, setComplexityMode, viewMode, setViewMode } = useAppStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-shell-topbar bg-bg-secondary border-b border-border z-40 flex items-center justify-between px-4">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <h1 className="text-body font-bold tracking-tight">
          <span className="text-text-primary">FTX</span>
          <span className="text-accent-amber">plorer</span>
        </h1>
      </div>

      {/* Center: Search (shell only — wired up in Phase 5) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search events, people, entities... (Cmd+K)"
            className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-1.5 text-body-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:border-accent-amber/50 transition-colors"
            disabled
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-caption text-text-muted bg-bg-surface px-1.5 py-0.5 rounded border border-border">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
        <Toggle
          options={viewModeOptions}
          value={viewMode}
          onChange={setViewMode}
          size="sm"
        />
        <div className="w-px h-5 bg-border" />
        <Toggle
          options={complexityOptions}
          value={complexityMode}
          onChange={setComplexityMode}
          size="sm"
        />
      </div>
    </header>
  );
}
