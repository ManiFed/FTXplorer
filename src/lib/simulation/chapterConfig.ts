import type { NarrativeChapterConfig, StateVector } from '@/types';
import { calibrationDatasets } from './calibration';

function baseState(multiplier: number): StateVector {
  const exchangeLiquidAssets = 5.5 * multiplier;
  const customerLiabilities = 6.2 * multiplier;
  const liquidityGap = exchangeLiquidAssets - customerLiabilities;

  return {
    exchange_liquid_assets: exchangeLiquidAssets,
    customer_liabilities: customerLiabilities,
    alameda_nav: 3.8 * multiplier,
    ftt_price: 26 * multiplier ** 0.08,
    btc_price: 23000 * multiplier ** 0.04,
    withdrawal_rate: 0.17,
    regulatory_pressure_index: 42,
    media_sentiment_index: 47,
    liquidity_gap: liquidityGap,
  };
}

const regulatoryEmpirical = calibrationDatasets.find((d) => d.id === 'regulatory-response-timing')?.values ?? [8, 13, 21];

export function getChapterSimulationConfig(chapterNumber: number, chapterId: string, chapterTitle: string): NarrativeChapterConfig {
  const chapterScale = Math.max(1, 1 + chapterNumber * 0.04);

  return {
    id: chapterId,
    title: chapterTitle,
    historical_date_range: {
      start: '2022-10-01',
      end: '2022-11-30',
    },
    baseline_state_vector: baseState(chapterScale),
    decision_fork_config: {
      disclosureDelayDays: {
        type: 'normal',
        mean: 12,
        variance: 16,
        min: 1,
        max: 45,
        confidence: 0.74,
        label: 'Disclosure Delay',
      },
      coverageRatio: {
        type: 'lognormal',
        mean: 0.58,
        variance: 0.05,
        min: 0.12,
        max: 1,
        confidence: 0.7,
        label: 'Coverage Ratio at Disclosure',
      },
      btcPriceDrift: {
        type: 'normal',
        mean: -0.002,
        variance: 0.0008,
        min: -0.08,
        max: 0.05,
        confidence: 0.78,
        label: 'BTC Price Drift (daily)',
      },
      riskSentimentIndex: {
        type: 'uniform',
        mean: 44,
        variance: 196,
        min: 20,
        max: 75,
        confidence: 0.65,
        label: 'Risk Sentiment Index',
      },
      regulatoryResponseSpeed: {
        type: 'empirical',
        mean: 14,
        variance: 36,
        empiricalSamples: regulatoryEmpirical,
        min: 2,
        max: 40,
        confidence: 0.82,
        label: 'Regulatory Response Speed (days)',
      },
    },
    narrative_template:
      'Model estimate: In this branch, disclosure lag of {{disclosureDelayDays}} days with coverage near {{coverageRatio}} drove a median terminal liquidity gap of {{terminalLiquidityGap}} and a customer recovery expectation of {{expectedRecovery}}%.',
  };
}
