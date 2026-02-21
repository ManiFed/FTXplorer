'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useWalkthroughStore, useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const EXPLORE_LINKS = [
  { label: 'Master Timeline', path: '/timeline', description: 'Explore the full timeline of events' },
  { label: 'People & Influence', path: '/people', description: 'Discover the key players and their connections' },
  { label: 'Financial Reconstruction', path: '/financial', description: 'Trace where the money went' },
  { label: 'Trial Explorer', path: '/trial', description: 'Dive into the evidence and testimony' },
];

const HUMAN_COST = [
  { label: 'Customer Losses', value: '$8.7B+', detail: 'Estimated total customer deposits lost' },
  { label: 'Creditors Affected', value: '1M+', detail: 'Individual and institutional creditors' },
  { label: 'Companies Collapsed', value: '130+', detail: 'FTX-affiliated entities in bankruptcy' },
  { label: 'Crypto Market Impact', value: '$200B+', detail: 'Estimated market cap wiped in contagion' },
];

export function WalkthroughSummary() {
  const { decisions, resetWalkthrough, simulationRuns } = useWalkthroughStore();
  const { setViewMode, complexityMode } = useAppStore();

  const decisionCount = Object.keys(decisions).length;
  const allRuns = Object.values(simulationRuns).flat();
  const latestRun = allRuns[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto px-6 py-16"
    >
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-16"
      >
        <h1 className="text-display font-bold text-text-primary mb-4">
          You&apos;ve finished the story.
        </h1>
        <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
          You made {decisionCount} decisions along the way. Each one mirrored a real choice
          that shaped the largest fraud in cryptocurrency history.
        </p>
      </motion.div>


      {complexityMode === 'expert' && latestRun && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-10 rounded-lg border border-accent-amber/30 bg-accent-amber/5 p-5"
        >
          <h2 className="text-heading-3 font-bold text-text-primary mb-2">Counterfactual model roll-up</h2>
          <p className="text-body-sm text-text-secondary mb-3">Model-based estimate from your final chained run (seed {latestRun.seed}).</p>
          <div className="grid sm:grid-cols-3 gap-3 text-body-sm">
            <div className="rounded border border-border p-3 bg-bg-secondary">Cumulative recovery EV: {(latestRun.recovery_distribution.expectedValue * 100).toFixed(1)}%</div>
            <div className="rounded border border-border p-3 bg-bg-secondary">Final liquidity gap (median): {latestRun.final_state_vector.liquidity_gap.toFixed(2)}</div>
            <div className="rounded border border-border p-3 bg-bg-secondary">Regulatory settlement probability: {((latestRun.outcome_summary.find((o) => o.label === 'regulatory_settlement')?.probability ?? 0) * 100).toFixed(1)}%</div>
          </div>
        </motion.div>
      )}
      {/* Human Cost Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-heading-2 font-bold text-text-primary mb-6 text-center">
          The Human Cost
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {HUMAN_COST.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <Card variant="outlined" padding="md" className="text-center">
                <div className="text-heading-1 font-bold text-danger mb-1">{item.value}</div>
                <div className="text-body-sm font-semibold text-text-primary">{item.label}</div>
                <div className="text-caption text-text-muted mt-1">{item.detail}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fraud Growth Visualization (simplified) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-16"
      >
        <h2 className="text-heading-2 font-bold text-text-primary mb-6 text-center">
          How the Fraud Grew
        </h2>
        <div className="bg-bg-tertiary rounded-lg p-6 border border-border">
          <div className="flex items-end justify-between h-48 gap-2">
            {[
              { year: '2019', pct: 5, label: 'FTX Founded' },
              { year: '2020', pct: 12, label: 'Growth' },
              { year: '2021', pct: 30, label: 'Bull Market' },
              { year: 'May 22', pct: 60, label: 'Terra/Luna' },
              { year: 'Jun 22', pct: 75, label: 'Deepening' },
              { year: 'Sep 22', pct: 85, label: 'Unsustainable' },
              { year: 'Nov 22', pct: 100, label: 'Collapse' },
            ].map((bar, i) => (
              <motion.div
                key={bar.year}
                className="flex-1 flex flex-col items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <span className="text-[9px] text-text-muted">{bar.label}</span>
                <motion.div
                  className="w-full rounded-t"
                  style={{
                    backgroundColor: bar.pct > 80 ? 'var(--danger)' : bar.pct > 50 ? 'var(--warning)' : 'var(--accent-amber)',
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${bar.pct}%` }}
                  transition={{ duration: 0.6, delay: 1 + i * 0.1 }}
                />
                <span className="text-[10px] text-text-muted">{bar.year}</span>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-4">
            <span className="text-caption text-text-muted">
              Estimated balance sheet gap (relative scale)
            </span>
          </div>
        </div>
      </motion.div>

      {/* Explore Deeper CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mb-12"
      >
        <h2 className="text-heading-2 font-bold text-text-primary mb-6 text-center">
          Explore Deeper
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPLORE_LINKS.map((link) => (
            <Link key={link.path} href={link.path} onClick={() => setViewMode('explore')}>
              <Card variant="default" padding="md" hover className="h-full">
                <h3 className="text-body font-semibold text-text-primary mb-1">{link.label}</h3>
                <p className="text-body-sm text-text-secondary">{link.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Restart */}
      <div className="text-center">
        <Button variant="ghost" onClick={resetWalkthrough}>
          Restart the walkthrough
        </Button>
      </div>
    </motion.div>
  );
}
