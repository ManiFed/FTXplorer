// ============================================================
// FTXplorer — Global TypeScript Types
// ============================================================

// --- Complexity & Mode ---

export type ComplexityMode = 'beginner' | 'researcher' | 'expert';
export type ViewMode = 'play' | 'explore';

// --- Evidence Confidence ---

export type ConfidenceLevel = 'established' | 'disputed' | 'alleged';

// --- Navigation ---

export interface NavModule {
  id: string;
  label: string;
  path: string;
  icon: string;
  description: string;
}

// --- Events ---

export interface TimelineEvent {
  id: string;
  date: string;
  endDate?: string;
  title: string;
  description: string;
  category: EventCategory;
  confidenceLevel: ConfidenceLevel;
  moduleLinks: string[];
  people?: string[];
  entities?: string[];
  dollarAmount?: number;
  sources?: Source[];
}

export type EventCategory =
  | 'corporate'
  | 'trading'
  | 'regulatory'
  | 'media'
  | 'market'
  | 'onchain'
  | 'trial'
  | 'personal'
  | 'political'
  | 'influence';

// --- People ---

export interface Person {
  id: string;
  name: string;
  role: string;
  bio: string;
  legalOutcome?: string;
  portraitUrl?: string;
  category: PersonCategory;
}

export type PersonCategory =
  | 'inner-circle'
  | 'ftx-team'
  | 'investor'
  | 'political'
  | 'regulatory'
  | 'legal'
  | 'media'
  | 'celebrity';

// --- Entities ---

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  jurisdiction: string;
  incorporationDate?: string;
  dissolutionDate?: string;
  parentId?: string;
  description?: string;
}

export type EntityType =
  | 'exchange'
  | 'trading-firm'
  | 'holding-company'
  | 'subsidiary'
  | 'bank-account'
  | 'other';

// --- Exhibits ---

export interface Exhibit {
  id: string;
  title: string;
  type: ExhibitType;
  description: string;
  sourceUrl?: string;
  confidenceLevel: ConfidenceLevel;
}

export type ExhibitType =
  | 'document'
  | 'communication'
  | 'financial'
  | 'testimony'
  | 'onchain';

// --- Sources ---

export interface Source {
  id: string;
  title: string;
  url?: string;
  type: 'court-filing' | 'news-article' | 'tweet' | 'signal-message' | 'document' | 'onchain' | 'testimony';
  date?: string;
  confidenceLevel: ConfidenceLevel;
}

// --- Chapters (Walkthrough) ---

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  dateRange: {
    start: string;
    end: string;
  };
  narrative: string;
  keyFacts: KeyFact[];
  primarySources: PrimarySource[];
  chartConfig?: ChartConfig;
  decisionFork?: DecisionFork;
}

export interface KeyFact {
  text: string;
  confidenceLevel: ConfidenceLevel;
}

export interface PrimarySource {
  type: 'tweet' | 'signal' | 'document' | 'article' | 'court-filing';
  author?: string;
  date: string;
  content: string;
  attribution: string;
  url?: string;
}

export interface ChartConfig {
  type: 'line' | 'stacked-area' | 'bar';
  title: string;
  dataKey: string;
  datasets: ChartDataset[];
  yAxisLabel?: string;
  annotations?: ChartAnnotation[];
}

export interface ChartDataset {
  label: string;
  color: string;
  data: { date: string; value: number }[];
}

export interface ChartAnnotation {
  date: string;
  label: string;
  color?: string;
}

export interface DecisionFork {
  prompt: string;
  context: string;
  options: DecisionOption[];
}

export interface DecisionOption {
  id: string;
  label: string;
  consequence: string;
  isActual: boolean;
}

// --- Financial Snapshots ---

export interface FinancialSnapshot {
  id: string;
  date: string;
  entityId: string;
  assets: number;
  liabilities: number;
  metadata?: Record<string, unknown>;
}

// --- Wallet ---

export interface WalletAddress {
  id: string;
  address: string;
  chain: string;
  entityId: string;
  label: string;
}

// --- Simulation ---

export interface SimulationRun {
  id: string;
  userId?: string;
  forkId: string;
  parameters: Record<string, number>;
  results: SimulationResults;
  createdAt: string;
}

export interface SimulationResults {
  paths: number;
  median: number[];
  p10: number[];
  p90: number[];
  p5: number[];
  p95: number[];
  outcomes: { label: string; probability: number }[];
}
