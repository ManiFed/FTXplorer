'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import chaptersData from '../../../public/data/chapters.json';
import { useAppStore, useWalkthroughStore } from '@/lib/store';
import { Toggle } from '@/components/ui/Toggle';
import { NAV_MODULES } from '@/lib/navigation';
import type { Chapter, ComplexityMode, ViewMode } from '@/types';

const complexityOptions = [
  { value: 'beginner' as ComplexityMode, label: 'Beginner' },
  { value: 'researcher' as ComplexityMode, label: 'Researcher' },
  { value: 'expert' as ComplexityMode, label: 'Expert' },
];

const viewModeOptions = [
  { value: 'play' as ViewMode, label: 'Play' },
  { value: 'explore' as ViewMode, label: 'Explore' },
];

type SearchResult =
  | { id: string; type: 'module'; title: string; subtitle: string; path: string }
  | { id: string; type: 'chapter'; title: string; subtitle: string; chapterNumber: number };

export function TopNav() {
  const router = useRouter();
  const { complexityMode, setComplexityMode, viewMode, setViewMode } = useAppStore();
  const { setCurrentChapter, setWalkthroughComplete } = useWalkthroughStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const chapters = chaptersData as Chapter[];

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const moduleMatches: SearchResult[] = NAV_MODULES
      .filter((module) => `${module.label} ${module.description}`.toLowerCase().includes(q))
      .map((module) => ({
        id: module.id,
        type: 'module' as const,
        title: module.label,
        subtitle: module.description,
        path: module.path,
      }));

    const chapterMatches: SearchResult[] = chapters
      .filter((chapter) => {
        const sourceText = chapter.primarySources.map((source) => source.attribution).join(' ');
        const factText = chapter.keyFacts.map((fact) => fact.text).join(' ');
        return `${chapter.title} ${chapter.subtitle} ${sourceText} ${factText}`.toLowerCase().includes(q);
      })
      .slice(0, 6)
      .map((chapter) => ({
        id: chapter.id,
        type: 'chapter' as const,
        title: `Chapter ${chapter.number}: ${chapter.title}`,
        subtitle: chapter.subtitle,
        chapterNumber: chapter.number,
      }));

    return [...moduleMatches, ...chapterMatches].slice(0, 8);
  }, [chapters, query]);

  const handleSearchSelect = (result: SearchResult) => {
    if (result.type === 'module') {
      setViewMode(result.id === 'walkthrough' ? 'play' : 'explore');
      router.push(result.path);
    } else {
      setWalkthroughComplete(false);
      setCurrentChapter(result.chapterNumber);
      setViewMode('play');
      router.push('/walkthrough');
    }

    setQuery('');
    setOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-shell-topbar bg-bg-secondary border-b border-border z-40 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <h1 className="text-body font-bold tracking-tight">
          <span className="text-text-primary">FTX</span>
          <span className="text-accent-amber">plorer</span>
        </h1>
      </div>

      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search events, people, entities..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-1.5 text-body-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:border-accent-amber/50 transition-colors"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-caption text-text-muted bg-bg-surface px-1.5 py-0.5 rounded border border-border">
            ⌘K
          </kbd>

          {open && query.trim().length > 0 && (
            <div className="absolute top-[calc(100%+0.4rem)] left-0 right-0 bg-bg-secondary border border-border rounded-lg shadow-2xl overflow-hidden">
              {results.length > 0 ? (
                results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSearchSelect(result)}
                    className="w-full text-left px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-bg-surface transition-colors"
                  >
                    <div className="flex items-center gap-2 text-caption uppercase tracking-widest text-accent-amber mb-1">
                      {result.type}
                    </div>
                    <div className="text-body-sm text-text-primary font-medium">{result.title}</div>
                    <div className="text-caption text-text-muted line-clamp-1">{result.subtitle}</div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-body-sm text-text-muted">No results found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Toggle options={viewModeOptions} value={viewMode} onChange={setViewMode} size="sm" />
        <div className="w-px h-5 bg-border" />
        <Toggle options={complexityOptions} value={complexityMode} onChange={setComplexityMode} size="sm" />
      </div>
    </header>
  );
}
