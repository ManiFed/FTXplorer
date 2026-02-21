import type {
  DecisionForkConfig,
  DistributionConfig,
  OutcomeProbability,
  SimulationPathSummary,
  SimulationRunSummary,
  StateVector,
} from '@/types';

interface MonteCarloInput {
  chapterId: string;
  baselineState: StateVector;
  config: DecisionForkConfig;
  seed: number;
  pathCount?: number;
  horizonDays?: number;
  narrativeTemplate: string;
}

function createRng(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: () => number) {
  const u1 = Math.max(rng(), 1e-12);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function sample(config: DistributionConfig, rng: () => number): number {
  const clamp = (v: number) => Math.max(config.min ?? -Infinity, Math.min(config.max ?? Infinity, v));

  switch (config.type) {
    case 'normal':
      return clamp(config.mean + gaussian(rng) * Math.sqrt(Math.max(config.variance, 1e-8)));
    case 'lognormal': {
      const sigmaSq = Math.log(1 + config.variance / Math.max(config.mean ** 2, 1e-6));
      const mu = Math.log(Math.max(config.mean, 1e-6)) - sigmaSq / 2;
      return clamp(Math.exp(mu + Math.sqrt(sigmaSq) * gaussian(rng)));
    }
    case 'uniform': {
      const min = config.min ?? config.mean - Math.sqrt(3 * config.variance);
      const max = config.max ?? config.mean + Math.sqrt(3 * config.variance);
      return min + (max - min) * rng();
    }
    case 'empirical': {
      const values = config.empiricalSamples?.length ? config.empiricalSamples : [config.mean];
      const idx = Math.floor(rng() * values.length);
      return clamp(values[idx]);
    }
  }
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const index = (sorted.length - 1) * p;
  const lo = Math.floor(index);
  const hi = Math.ceil(index);
  if (lo === hi) return sorted[lo];
  const frac = index - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

function summarizePaths(paths: number[][], horizonDays: number): SimulationPathSummary[] {
  return Array.from({ length: horizonDays }, (_, day) => {
    const atDay = paths.map((path) => path[day]).sort((a, b) => a - b);
    return {
      day,
      median: percentile(atDay, 0.5),
      p10: percentile(atDay, 0.1),
      p90: percentile(atDay, 0.9),
      p5: percentile(atDay, 0.05),
      p95: percentile(atDay, 0.95),
    };
  });
}

function makeNarrative(template: string, replacements: Record<string, string>) {
  return Object.entries(replacements).reduce((acc, [key, value]) => acc.replace(`{{${key}}}`, value), template);
}

export function runMonteCarloChapter(input: MonteCarloInput): SimulationRunSummary {
  const pathCount = input.pathCount ?? 10000;
  const horizonDays = input.horizonDays ?? 30;
  const rng = createRng(input.seed);

  const liquidityPaths: number[][] = Array.from({ length: pathCount }, () => Array(horizonDays).fill(0));
  const fttPaths: number[][] = Array.from({ length: pathCount }, () => Array(horizonDays).fill(0));

  const liquidityTerminal: number[] = [];
  const recoveryDistribution: number[] = [];
  const fttTerminal: number[] = [];

  let orderly = 0;
  let disorderly = 0;
  let criminal = 0;
  let settlement = 0;

  for (let path = 0; path < pathCount; path += 1) {
    const disclosureDelay = sample(input.config.disclosureDelayDays, rng);
    const coverage = sample(input.config.coverageRatio, rng);
    const btcDrift = sample(input.config.btcPriceDrift, rng);
    const riskSentiment = sample(input.config.riskSentimentIndex, rng);
    const regulatoryDays = sample(input.config.regulatoryResponseSpeed, rng);

    let liquidityGap = input.baselineState.liquidity_gap;
    let fttPrice = input.baselineState.ftt_price;
    let insolvencyDays = 0;

    for (let day = 0; day < horizonDays; day += 1) {
      const sentimentShock = (50 - riskSentiment) / 100;
      const disclosurePenalty = day >= disclosureDelay ? 0.38 : 0.12;
      const withdrawalRate = Math.max(
        0,
        input.baselineState.withdrawal_rate + sentimentShock * 0.12 + disclosurePenalty + Math.abs(btcDrift) * 0.8
      );

      const forcedSellVolume = Math.max(0, withdrawalRate * (1 - coverage));
      const marketLiquidityFactor = 0.08 + Math.max(0, 0.4 - riskSentiment / 250);
      const fttImpact = marketLiquidityFactor * forcedSellVolume;

      fttPrice = Math.max(0.1, fttPrice * (1 + btcDrift - fttImpact));
      liquidityGap += input.baselineState.exchange_liquid_assets * (coverage - withdrawalRate) * 0.03;

      if (day >= regulatoryDays) {
        liquidityGap += 0.03;
      }

      if (liquidityGap < 0) insolvencyDays += 1;

      liquidityPaths[path][day] = liquidityGap;
      fttPaths[path][day] = fttPrice;
    }

    liquidityTerminal.push(liquidityGap);
    fttTerminal.push(fttPrice);
    const recovery = Math.max(0, Math.min(1, coverage * (1 - insolvencyDays / (horizonDays * 1.5))));
    recoveryDistribution.push(recovery);

    if (liquidityGap >= 0 && recovery >= 0.7) orderly += 1;
    if (liquidityGap < 0 || recovery < 0.4) disorderly += 1;
    if (insolvencyDays >= 5 && disclosureDelay > 7) criminal += 1;
    if (regulatoryDays < 10 && recovery >= 0.4 && recovery <= 0.75) settlement += 1;
  }

  const orderedLiquidity = [...liquidityTerminal].sort((a, b) => a - b);
  const orderedRecovery = [...recoveryDistribution].sort((a, b) => a - b);
  const orderedFtt = [...fttTerminal].sort((a, b) => a - b);

  const fanChart = summarizePaths(liquidityPaths, horizonDays);
  const fttTrajectory = summarizePaths(fttPaths, horizonDays);

  const outcomes: OutcomeProbability[] = [
    { label: 'orderly_wind_down', probability: orderly / pathCount },
    { label: 'disorderly_collapse', probability: disorderly / pathCount },
    { label: 'criminal_charges', probability: criminal / pathCount },
    { label: 'regulatory_settlement', probability: settlement / pathCount },
  ];

  const narrative = makeNarrative(input.narrativeTemplate, {
    disclosureDelayDays: percentile(orderedLiquidity.map((_, idx) => sample(input.config.disclosureDelayDays, createRng(input.seed + idx))), 0.5).toFixed(1),
    coverageRatio: (percentile(orderedRecovery, 0.5) * 100).toFixed(1) + '%',
    terminalLiquidityGap: percentile(orderedLiquidity, 0.5).toFixed(2),
    expectedRecovery: (orderedRecovery.reduce((acc, value) => acc + value, 0) / pathCount * 100).toFixed(1),
  });

  return {
    run_id: `${input.chapterId}-${input.seed}-${Date.now()}`,
    chapter_id: input.chapterId,
    parameter_config: input.config,
    seed: input.seed,
    outcome_summary: outcomes,
    final_state_vector: {
      ...input.baselineState,
      liquidity_gap: percentile(orderedLiquidity, 0.5),
      ftt_price: percentile(orderedFtt, 0.5),
      withdrawal_rate: input.baselineState.withdrawal_rate + 0.03,
    },
    full_distribution_snapshot: {
      liquidityGap: liquidityTerminal,
      recoveryRate: recoveryDistribution,
      fttTerminalPrice: fttTerminal,
    },
    fan_chart: fanChart,
    recovery_distribution: {
      values: recoveryDistribution,
      expectedValue: orderedRecovery.reduce((acc, value) => acc + value, 0) / pathCount,
      ciLow: percentile(orderedRecovery, 0.05),
      ciHigh: percentile(orderedRecovery, 0.95),
    },
    ftt_price_trajectory: fttTrajectory,
    likely_path_narrative: `Model estimate only: ${narrative}`,
    generatedAt: new Date().toISOString(),
  };
}
