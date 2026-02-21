'use client';

import { useMemo, useState } from 'react';
import chaptersData from '../../../../public/data/chapters.json';
import { CounterfactualLab } from '@/components/modules/walkthrough/CounterfactualLab';
import { useAppStore, useWalkthroughStore } from '@/lib/store';
import type { Chapter, SimulationRunSummary } from '@/types';

function RunSnapshot({ run, title }: { run: SimulationRunSummary; title: string }) {
  const settlement = run.outcome_summary.find((o) => o.label === 'regulatory_settlement')?.probability ?? 0;

  return (
    <div className="rounded-lg border border-border bg-bg-secondary p-4">
      <h4 className="text-body font-semibold text-text-primary mb-2">{title}</h4>
      <p className="text-caption text-text-muted mb-3">Run {run.run_id} • Seed {run.seed}</p>
      <div className="grid sm:grid-cols-2 gap-2 text-body-sm">
        <div className="rounded border border-border p-2">Recovery EV: {(run.recovery_distribution.expectedValue * 100).toFixed(1)}%</div>
        <div className="rounded border border-border p-2">Liquidity gap: {run.final_state_vector.liquidity_gap.toFixed(2)}</div>
        <div className="rounded border border-border p-2">FTT terminal: {run.final_state_vector.ftt_price.toFixed(2)}</div>
        <div className="rounded border border-border p-2">Settlement prob: {(settlement * 100).toFixed(1)}%</div>
      </div>
    </div>
  );
}

export function SimulationWorkbench() {
  const chapters = chaptersData as Chapter[];
  const { complexityMode } = useAppStore();
  const { simulationRuns } = useWalkthroughStore();
  const [chapterId, setChapterId] = useState(chapters[0]?.id ?? '');
  const [leftRunId, setLeftRunId] = useState('');
  const [rightRunId, setRightRunId] = useState('');

  const activeChapter = chapters.find((chapter) => chapter.id === chapterId) ?? chapters[0];
  const chapterRuns = useMemo(() => simulationRuns[chapterId] ?? [], [chapterId, simulationRuns]);

  const leftRun = chapterRuns.find((run) => run.run_id === leftRunId) ?? chapterRuns[0];
  const rightRun = chapterRuns.find((run) => run.run_id === rightRunId) ?? chapterRuns[1];

  const exportRun = (run: SimulationRunSummary | undefined) => {
    if (!run) return;

    const blob = new Blob([JSON.stringify(run, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${run.chapter_id}-${run.seed}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!activeChapter) {
    return <p className="text-text-muted">Simulation chapters unavailable.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-caption text-text-secondary">
          Chapter
          <select
            value={chapterId}
            onChange={(event) => setChapterId(event.target.value)}
            className="mt-1 block rounded border border-border bg-bg-secondary px-3 py-2 text-body-sm"
          >
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                Chapter {chapter.number}: {chapter.title}
              </option>
            ))}
          </select>
        </label>
        <div className="text-caption text-text-muted">
          Saved runs for this chapter: <span className="text-text-primary font-semibold">{chapterRuns.length}</span>
        </div>
      </div>

      {complexityMode !== 'expert' ? (
        <div className="rounded-lg border border-border bg-bg-secondary p-4">
          <p className="text-body-sm text-text-secondary">
            Expert Mode is required for Monte Carlo controls and percentile chaining. Switch to Expert in the top mode selector.
          </p>
        </div>
      ) : (
        <CounterfactualLab
          chapterNumber={activeChapter.number}
          chapterId={activeChapter.id}
          chapterTitle={activeChapter.title}
        />
      )}

      {chapterRuns.length > 0 && (
        <div className="rounded-lg border border-border p-4 bg-bg-surface space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-body font-semibold text-text-primary">Comparative run viewer</h3>
            <button
              type="button"
              onClick={() => exportRun(chapterRuns[0])}
              className="px-3 py-1 rounded border border-border text-caption text-text-secondary hover:text-text-primary"
            >
              Export latest run JSON
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <label className="text-caption text-text-secondary">
              Left run
              <select
                value={leftRun?.run_id ?? ''}
                onChange={(event) => setLeftRunId(event.target.value)}
                className="mt-1 block rounded border border-border bg-bg-secondary px-3 py-2 text-body-sm"
              >
                {chapterRuns.map((run) => (
                  <option key={run.run_id} value={run.run_id}>
                    {new Date(run.generatedAt).toLocaleString()} • seed {run.seed}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-caption text-text-secondary">
              Right run
              <select
                value={rightRun?.run_id ?? ''}
                onChange={(event) => setRightRunId(event.target.value)}
                className="mt-1 block rounded border border-border bg-bg-secondary px-3 py-2 text-body-sm"
              >
                {chapterRuns.map((run) => (
                  <option key={run.run_id} value={run.run_id}>
                    {new Date(run.generatedAt).toLocaleString()} • seed {run.seed}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {leftRun && <RunSnapshot run={leftRun} title="Run A" />}
            {rightRun && <RunSnapshot run={rightRun} title="Run B" />}
          </div>
        </div>
      )}
    </div>
  );
}
