'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ComplexityMode, SimulationRunSummary, StateVector, ViewMode } from '@/types';

// --- Global App Store ---

interface AppState {
  complexityMode: ComplexityMode;
  setComplexityMode: (mode: ComplexityMode) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  viewDate: Date;
  setViewDate: (date: Date) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
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

type ChainingSelection = 'median' | 'p10' | 'p90' | 'custom';

interface WalkthroughState {
  currentChapter: number;
  setCurrentChapter: (chapter: number) => void;
  completedChapters: Set<number>;
  markChapterComplete: (chapter: number) => void;
  decisions: Record<number, string>;
  makeDecision: (chapter: number, optionId: string) => void;
  forkRevealed: boolean;
  setForkRevealed: (revealed: boolean) => void;
  walkthroughComplete: boolean;
  setWalkthroughComplete: (complete: boolean) => void;

  simulationRuns: Record<string, SimulationRunSummary[]>;
  saveSimulationRun: (chapterId: string, run: SimulationRunSummary) => void;
  selectedChainState: Record<string, StateVector>;
  setSelectedChainState: (chapterId: string, stateVector: StateVector) => void;
  chainSelectionMode: ChainingSelection;
  setChainSelectionMode: (mode: ChainingSelection) => void;

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

  simulationRuns: {},
  saveSimulationRun: (chapterId, run) =>
    set((state) => ({
      simulationRuns: {
        ...state.simulationRuns,
        [chapterId]: [run, ...(state.simulationRuns[chapterId] ?? [])],
      },
    })),

  selectedChainState: {},
  setSelectedChainState: (chapterId, stateVector) =>
    set((state) => ({
      selectedChainState: { ...state.selectedChainState, [chapterId]: stateVector },
    })),

  chainSelectionMode: 'median',
  setChainSelectionMode: (mode) => set({ chainSelectionMode: mode }),

  resetWalkthrough: () =>
    set({
      currentChapter: 1,
      completedChapters: new Set(),
      decisions: {},
      forkRevealed: false,
      walkthroughComplete: false,
      simulationRuns: {},
      selectedChainState: {},
      chainSelectionMode: 'median',
    }),
}));
