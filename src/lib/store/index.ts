'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ComplexityMode, ViewMode } from '@/types';

// --- Global App Store ---

interface AppState {
  // Complexity mode: beginner | researcher | expert
  complexityMode: ComplexityMode;
  setComplexityMode: (mode: ComplexityMode) => void;

  // Play (walkthrough) vs Explore (dashboard)
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Master timeline scrubber date
  viewDate: Date;
  setViewDate: (date: Date) => void;

  // Sidebar collapsed state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Detail drawer
  drawerOpen: boolean;
  drawerContent: DrawerContent | null;
  openDrawer: (content: DrawerContent) => void;
  closeDrawer: () => void;
}

export interface DrawerContent {
  type: 'event' | 'person' | 'entity' | 'exhibit' | 'custom';
  id: string;
  title: string;
  data?: Record<string, unknown>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      complexityMode: 'beginner',
      setComplexityMode: (mode) => set({ complexityMode: mode }),

      viewMode: 'play',
      setViewMode: (mode) => set({ viewMode: mode }),

      viewDate: new Date('2022-11-11'),
      setViewDate: (date) => set({ viewDate: date }),

      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      drawerOpen: false,
      drawerContent: null,
      openDrawer: (content) => set({ drawerOpen: true, drawerContent: content }),
      closeDrawer: () => set({ drawerOpen: false, drawerContent: null }),
    }),
    {
      name: 'ftxplorer-app-state',
      partialize: (state) => ({
        complexityMode: state.complexityMode,
        viewMode: state.viewMode,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// --- Walkthrough Store ---

interface WalkthroughState {
  currentChapter: number;
  setCurrentChapter: (chapter: number) => void;

  // Track which chapters have been read
  completedChapters: Set<number>;
  markChapterComplete: (chapter: number) => void;

  // Decision fork selections: chapterId -> optionId
  decisions: Record<number, string>;
  makeDecision: (chapter: number, optionId: string) => void;

  // Whether current fork has been revealed
  forkRevealed: boolean;
  setForkRevealed: (revealed: boolean) => void;

  // Whether walkthrough is complete
  walkthroughComplete: boolean;
  setWalkthroughComplete: (complete: boolean) => void;

  // Reset walkthrough progress
  resetWalkthrough: () => void;
}

export const useWalkthroughStore = create<WalkthroughState>()((set) => ({
  currentChapter: 1,
  setCurrentChapter: (chapter) => set({ currentChapter: chapter, forkRevealed: false }),

  completedChapters: new Set(),
  markChapterComplete: (chapter) =>
    set((state) => ({
      completedChapters: new Set([...state.completedChapters, chapter]),
    })),

  decisions: {},
  makeDecision: (chapter, optionId) =>
    set((state) => ({
      decisions: { ...state.decisions, [chapter]: optionId },
    })),

  forkRevealed: false,
  setForkRevealed: (revealed) => set({ forkRevealed: revealed }),

  walkthroughComplete: false,
  setWalkthroughComplete: (complete) => set({ walkthroughComplete: complete }),

  resetWalkthrough: () =>
    set({
      currentChapter: 1,
      completedChapters: new Set(),
      decisions: {},
      forkRevealed: false,
      walkthroughComplete: false,
    }),
}));
