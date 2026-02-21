import { RecoveryCalculator } from '@/components/modules/bankruptcy/RecoveryCalculator';

const claimsByTier = [
  { tier: 'Institutional claims ($10M+)', count: 214, estAmount: '$11.2B' },
  { tier: 'Mid-sized claims ($250K-$10M)', count: 3418, estAmount: '$3.7B' },
  { tier: 'Retail claims (<$250K)', count: 987212, estAmount: '$4.9B' },
];

export default function BankruptcyPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-heading-1 font-bold text-text-primary mb-2">Bankruptcy & Recovery</h1>
        <p className="text-body text-text-secondary max-w-3xl">
          Track the Chapter 11 process, inspect creditor claim tiers, and model potential recoveries under different
          restructuring outcomes.
        </p>
      </div>

      <section className="rounded-lg border border-border bg-bg-surface p-5">
        <h2 className="text-heading-3 font-semibold text-text-primary">Claims Explorer Snapshot</h2>
        <p className="mt-1 text-sm text-text-secondary">Modeled claim totals grouped by filing size tier.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {claimsByTier.map((tier) => (
            <div key={tier.tier} className="rounded-md border border-border bg-bg-base p-4">
              <p className="text-xs uppercase tracking-wide text-text-muted">{tier.tier}</p>
              <p className="mt-2 text-lg font-semibold text-text-primary">{tier.estAmount}</p>
              <p className="text-sm text-text-secondary">{tier.count.toLocaleString()} claims</p>
            </div>
          ))}
        </div>
      </section>

      <RecoveryCalculator />
    </div>
  );
}
