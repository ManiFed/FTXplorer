'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';

interface CounterfactualLabProps {
  chapterNumber: number;
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

export function CounterfactualLab({ chapterNumber }: CounterfactualLabProps) {
  const [disclosureLag, setDisclosureLag] = useState(14);
  const [coverageRatio, setCoverageRatio] = useState(35);
  const [marketStress, setMarketStress] = useState(50);

  const outcomes = useMemo(() => {
    const orderly = Math.max(4, 70 - disclosureLag * 1.8 + coverageRatio * 0.7 - marketStress * 0.5 + chapterNumber * 0.6);
    const bankruptcy = Math.min(92, 18 + disclosureLag * 1.3 + marketStress * 0.6 - coverageRatio * 0.4);
    const enforcement = Math.min(96, 24 + disclosureLag * 0.8 + (100 - coverageRatio) * 0.4 + marketStress * 0.25);

    return {
      orderlyWindDown: Math.max(0, Math.min(100, orderly)),
      disorderlyCollapse: Math.max(0, Math.min(100, bankruptcy)),
      criminalCharges: Math.max(0, Math.min(100, enforcement)),
      projectedRecovery: Math.max(6, Math.min(95, 24 + coverageRatio * 0.55 - marketStress * 0.2 - disclosureLag * 0.45)),
    };
  }, [chapterNumber, coverageRatio, disclosureLag, marketStress]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-accent-amber/30 bg-accent-amber/5 p-5 mt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-body font-semibold text-text-primary">Counterfactual Lab</h4>
        <Badge variant="modeled">MODELED PROJECTION</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <label className="text-caption text-text-secondary">
          Disclosure lag ({disclosureLag} days)
          <input type="range" min={1} max={60} value={disclosureLag} onChange={(e) => setDisclosureLag(Number(e.target.value))} className="w-full mt-2" />
        </label>
        <label className="text-caption text-text-secondary">
          Liquidity coverage ({coverageRatio}%)
          <input type="range" min={5} max={100} value={coverageRatio} onChange={(e) => setCoverageRatio(Number(e.target.value))} className="w-full mt-2" />
        </label>
        <label className="text-caption text-text-secondary">
          Market stress ({marketStress}%)
          <input type="range" min={0} max={100} value={marketStress} onChange={(e) => setMarketStress(Number(e.target.value))} className="w-full mt-2" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <OutcomeCard label="Orderly wind-down" value={pct(outcomes.orderlyWindDown)} />
        <OutcomeCard label="Disorderly collapse" value={pct(outcomes.disorderlyCollapse)} tone="danger" />
        <OutcomeCard label="Criminal charges" value={pct(outcomes.criminalCharges)} tone="warning" />
        <OutcomeCard label="Customer recovery" value={pct(outcomes.projectedRecovery)} tone="success" />
      </div>
    </motion.div>
  );
}

function OutcomeCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'warning' | 'danger' | 'success' }) {
  const toneClass = {
    default: 'text-text-primary',
    warning: 'text-warning',
    danger: 'text-danger',
    success: 'text-success',
  }[tone];

  return (
    <div className="rounded-lg border border-border bg-bg-secondary px-3 py-2.5">
      <div className="text-caption text-text-muted">{label}</div>
      <div className={`text-body font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
