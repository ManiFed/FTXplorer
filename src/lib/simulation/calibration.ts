import type { ConfidenceLevel } from '@/types';

export interface CalibrationDataset {
  id: string;
  name: string;
  sourceReference: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  timeRange: string;
  values: number[];
}

export const calibrationDatasets: CalibrationDataset[] = [
  {
    id: 'btc-volatility',
    name: 'Historical BTC volatility (stress windows)',
    sourceReference: 'CoinMetrics and FTX period spot data (2019-2022)',
    confidence: 'established',
    confidenceScore: 0.9,
    timeRange: '2019-01-01 to 2022-12-31',
    values: [0.022, 0.031, 0.028, 0.034, 0.04, 0.025, 0.029],
  },
  {
    id: 'withdrawal-velocity',
    name: 'Exchange withdrawal velocity during stress',
    sourceReference: 'Public bankruptcy filings and exchange reserve trackers',
    confidence: 'disputed',
    confidenceScore: 0.68,
    timeRange: '2021-01-01 to 2023-06-30',
    values: [0.08, 0.11, 0.17, 0.23, 0.31, 0.28],
  },
  {
    id: 'regulatory-response-timing',
    name: 'SEC/CFTC response timing in large fraud actions (days)',
    sourceReference: 'SEC/CFTC enforcement chronology (sampled cases)',
    confidence: 'established',
    confidenceScore: 0.81,
    timeRange: '2016-01-01 to 2024-01-01',
    values: [3, 4, 6, 8, 12, 13, 15, 18, 21, 27, 34],
  },
  {
    id: 'market-sentiment',
    name: 'Crypto market sentiment index',
    sourceReference: 'Fear & Greed style composite sentiment benchmark',
    confidence: 'alleged',
    confidenceScore: 0.62,
    timeRange: '2020-01-01 to 2022-12-31',
    values: [28, 31, 39, 44, 48, 53, 60, 66, 71],
  },
];
