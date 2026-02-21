'use client';

import { useMemo, useState } from 'react';

import { Card } from '@/components/ui/Card';

type ClaimClass = 'secured' | 'administrative' | 'unsecured' | 'equity' | 'subordinated';

const claimClassOptions: Array<{ value: ClaimClass; label: string; notes: string }> = [
  { value: 'secured', label: 'Secured creditor', notes: 'Collateral-backed loans and secured facilities.' },
  {
    value: 'administrative',
    label: 'Administrative expense',
    notes: 'Professional fees, chapter 11 operating costs, and court-approved expenses.',
  },
  {
    value: 'unsecured',
    label: 'General unsecured creditor',
    notes: 'Most customer claims and trade creditors without collateral.',
  },
  { value: 'equity', label: 'Equity holder', notes: 'Residual recovery only after creditor classes are paid.' },
  {
    value: 'subordinated',
    label: 'Subordinated claim',
    notes: 'Contractually junior obligations with last-priority recovery.',
  },
];

const recoveryRates: Record<ClaimClass, { current: number; best: number; worst: number }> = {
  secured: { current: 0.94, best: 1, worst: 0.76 },
  administrative: { current: 1, best: 1, worst: 0.88 },
  unsecured: { current: 0.73, best: 0.9, worst: 0.42 },
  equity: { current: 0.06, best: 0.19, worst: 0 },
  subordinated: { current: 0.11, best: 0.28, worst: 0 },
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function RecoveryCalculator() {
  const [claimAmount, setClaimAmount] = useState('100000');
  const [claimClass, setClaimClass] = useState<ClaimClass>('unsecured');

  const parsedClaimAmount = Number.parseFloat(claimAmount) || 0;
  const selectedRates = recoveryRates[claimClass];

  const outputs = useMemo(
    () => ({
      current: parsedClaimAmount * selectedRates.current,
      best: parsedClaimAmount * selectedRates.best,
      worst: parsedClaimAmount * selectedRates.worst,
    }),
    [parsedClaimAmount, selectedRates]
  );

  return (
    <Card className="space-y-5" padding="lg">
      <div>
        <h2 className="text-heading-3 font-semibold text-text-primary">Creditor Recovery Calculator</h2>
        <p className="text-sm text-text-secondary mt-1">
          Estimate modeled recoveries for a claim class under current, best-case, and worst-case plan assumptions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-text-secondary">Claim amount (USD)</span>
          <input
            type="number"
            min="0"
            step="1000"
            value={claimAmount}
            onChange={(event) => setClaimAmount(event.target.value)}
            className="w-full rounded-md border border-border bg-bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-text-secondary">Claim class</span>
          <select
            value={claimClass}
            onChange={(event) => setClaimClass(event.target.value as ClaimClass)}
            className="w-full rounded-md border border-border bg-bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent"
          >
            {claimClassOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-xs text-text-muted">
        {claimClassOptions.find((option) => option.value === claimClass)?.notes}
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Current plan estimate', value: outputs.current, rate: selectedRates.current },
          { label: 'Best-case plan', value: outputs.best, rate: selectedRates.best },
          { label: 'Worst-case plan', value: outputs.worst, rate: selectedRates.worst },
        ].map((result) => (
          <div key={result.label} className="rounded-md border border-border bg-bg-base p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">{result.label}</p>
            <p className="mt-2 text-xl font-semibold text-text-primary">{currencyFormatter.format(result.value)}</p>
            <p className="text-sm text-text-secondary">{Math.round(result.rate * 100)}% recovery</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
