'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useWalkthroughStore } from '@/lib/store';
import { getChapterSimulationConfig } from '@/lib/simulation/chapterConfig';
import { runMonteCarloChapter } from '@/lib/simulation/engine';
import { calibrationDatasets } from '@/lib/simulation/calibration';
import type { DecisionForkConfig, DistributionConfig, StateVector } from '@/types';

interface CounterfactualLabProps {
  chapterNumber: number;
  chapterId: string;
  chapterTitle: string;
}

function ParamField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  distribution,
  confidence,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step: number;
  distribution: DistributionConfig;
  confidence: number;
}) {
  return (
    <label className="text-caption text-text-secondary block">
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="text-text-muted">{distribution.type} • conf {Math.round(confidence * 100)}%</span>
      </div>
      <div className="text-body-sm font-semibold text-text-primary mt-1">{value.toFixed(step < 1 ? 3 : 1)}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2"
      />
    </label>
  );
}

export function CounterfactualLab({ chapterNumber, chapterId, chapterTitle }: CounterfactualLabProps) {
  const { simulationRuns, saveSimulationRun, selectedChainState, setSelectedChainState, chainSelectionMode, setChainSelectionMode } = useWalkthroughStore();
  const chapterConfig = useMemo(() => getChapterSimulationConfig(chapterNumber, chapterId, chapterTitle), [chapterId, chapterNumber, chapterTitle]);

  const upstreamState = selectedChainState[`chapter-${chapterNumber - 1}`] ?? chapterConfig.baseline_state_vector;

  const [seed, setSeed] = useState(20221102 + chapterNumber);
  const [paths, setPaths] = useState(10000);
  const [isRunning, setIsRunning] = useState(false);
  const [params, setParams] = useState<DecisionForkConfig>(chapterConfig.decision_fork_config);

  const chapterRuns = simulationRuns[chapterId] ?? [];
  const activeRun = chapterRuns[0];

  const updateParam = (key: keyof DecisionForkConfig, mean: number) => {
    setParams((prev) => ({
      ...prev,
      [key]: { ...prev[key], mean },
    }));
  };

  const runSimulation = async () => {
    setIsRunning(true);
    await Promise.resolve();
    const run = runMonteCarloChapter({
      chapterId,
      baselineState: upstreamState,
      config: params,
      seed,
      pathCount: paths,
      horizonDays: 35,
      narrativeTemplate: chapterConfig.narrative_template,
    });
    saveSimulationRun(chapterId, run);
    setSelectedChainState(`chapter-${chapterNumber}`, run.final_state_vector);
    setIsRunning(false);
  };

  const applyChainState = (mode: 'median' | 'p10' | 'p90' | 'custom') => {
    if (!activeRun) return;
    const percentileMap = {
      median: 0.5,
      p10: 0.1,
      p90: 0.9,
      custom: 0.5,
    } as const;
    const idx = Math.floor(activeRun.full_distribution_snapshot.liquidityGap.length * percentileMap[mode]);
    const liquidity = activeRun.full_distribution_snapshot.liquidityGap[Math.max(0, idx - 1)] ?? activeRun.final_state_vector.liquidity_gap;
    const ftt = activeRun.full_distribution_snapshot.fttTerminalPrice[Math.max(0, idx - 1)] ?? activeRun.final_state_vector.ftt_price;

    const nextState: StateVector = {
      ...activeRun.final_state_vector,
      liquidity_gap: liquidity,
      ftt_price: ftt,
    };

    setChainSelectionMode(mode);
    setSelectedChainState(`chapter-${chapterNumber}`, nextState);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-accent-amber/30 bg-accent-amber/5 p-5 mt-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-body font-semibold text-text-primary">Expert Mode Monte Carlo Lab</h4>
          <p className="text-caption text-text-muted">All outputs are model-based estimates and do not represent historical fact.</p>
        </div>
        <Badge variant="modeled">EXPERT MODE</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ParamField label="Disclosure Delay (days)" value={params.disclosureDelayDays.mean} onChange={(v) => updateParam('disclosureDelayDays', v)} min={1} max={45} step={1} distribution={params.disclosureDelayDays} confidence={params.disclosureDelayDays.confidence} />
        <ParamField label="Coverage Ratio" value={params.coverageRatio.mean} onChange={(v) => updateParam('coverageRatio', v)} min={0.1} max={1} step={0.01} distribution={params.coverageRatio} confidence={params.coverageRatio.confidence} />
        <ParamField label="BTC Drift (daily)" value={params.btcPriceDrift.mean} onChange={(v) => updateParam('btcPriceDrift', v)} min={-0.08} max={0.05} step={0.001} distribution={params.btcPriceDrift} confidence={params.btcPriceDrift.confidence} />
        <ParamField label="Risk Sentiment Index" value={params.riskSentimentIndex.mean} onChange={(v) => updateParam('riskSentimentIndex', v)} min={5} max={90} step={1} distribution={params.riskSentimentIndex} confidence={params.riskSentimentIndex.confidence} />
      </div>

      <div className="grid sm:grid-cols-3 gap-3 items-end">
        <label className="text-caption text-text-secondary">Deterministic seed
          <input type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value))} className="w-full mt-1 rounded border border-border bg-bg-secondary px-2 py-1 text-body-sm" />
        </label>
        <label className="text-caption text-text-secondary">Monte Carlo paths
          <input type="number" min={10000} step={1000} value={paths} onChange={(e) => setPaths(Math.max(10000, Number(e.target.value)))} className="w-full mt-1 rounded border border-border bg-bg-secondary px-2 py-1 text-body-sm" />
        </label>
        <Button variant="primary" onClick={runSimulation} disabled={isRunning}>{isRunning ? 'Running…' : 'Run 10,000+ path simulation'}</Button>
      </div>

      <div className="rounded-lg border border-border bg-bg-secondary p-3 text-caption text-text-muted">
        Calibration datasets: {calibrationDatasets.map((set) => `${set.name} (${set.timeRange}, score ${Math.round(set.confidenceScore * 100)}%)`).join(' • ')}
      </div>

      {activeRun && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-bg-secondary p-4">
              <h5 className="text-body-sm font-semibold text-text-primary mb-2">Outcome probability table</h5>
              <div className="space-y-2 text-body-sm">
                {activeRun.outcome_summary.map((outcome) => (
                  <div key={outcome.label} className="flex items-center justify-between">
                    <span className="text-text-secondary">{outcome.label.replaceAll('_', ' ')}</span>
                    <span className="font-semibold text-text-primary">{(outcome.probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-bg-secondary p-4">
              <h5 className="text-body-sm font-semibold text-text-primary mb-2">Customer recovery distribution</h5>
              <p className="text-body-sm text-text-secondary">Expected: {(activeRun.recovery_distribution.expectedValue * 100).toFixed(1)}% • CI: {(activeRun.recovery_distribution.ciLow * 100).toFixed(1)}% - {(activeRun.recovery_distribution.ciHigh * 100).toFixed(1)}%</p>
              <div className="mt-2 h-10 bg-bg-tertiary rounded overflow-hidden flex">
                {Array.from({ length: 20 }, (_, i) => {
                  const bucketMin = i / 20;
                  const bucketMax = (i + 1) / 20;
                  const count = activeRun.recovery_distribution.values.filter((v) => v >= bucketMin && v < bucketMax).length;
                  const opacity = Math.max(0.15, count / (paths / 8));
                  return <div key={i} style={{ opacity }} className="flex-1 bg-accent-amber border-r border-bg-tertiary" />;
                })}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-bg-secondary p-4">
            <h5 className="text-body-sm font-semibold text-text-primary mb-2">Fan chart (liquidity gap median + percentile bands)</h5>
            <div className="h-28 flex items-end gap-[2px]">
              {activeRun.fan_chart.map((point) => {
                const scale = Math.max(Math.abs(point.p95), Math.abs(point.p5), 1);
                const height = Math.max(8, (Math.abs(point.median) / scale) * 96);
                return (
                  <div key={point.day} className="flex-1 flex flex-col justify-end">
                    <div className={`w-full rounded-sm ${point.median < 0 ? 'bg-danger/70' : 'bg-success/70'}`} style={{ height }} />
                  </div>
                );
              })}
            </div>
            <p className="text-caption text-text-muted mt-2">Median path narrative: {activeRun.likely_path_narrative}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption text-text-muted">Seed next chapter with:</span>
            {(['median', 'p10', 'p90', 'custom'] as const).map((mode) => (
              <button key={mode} onClick={() => applyChainState(mode)} className={`px-3 py-1 rounded border text-caption ${chainSelectionMode === mode ? 'bg-accent-amber/20 border-accent-amber text-text-primary' : 'border-border text-text-secondary'}`}>
                {mode.toUpperCase()}
              </button>
            ))}
            <span className="text-caption text-text-muted">Saved runs: {chapterRuns.length}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
