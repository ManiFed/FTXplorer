import { z } from 'zod';

// --- Confidence ---
export const confidenceLevelSchema = z.enum(['established', 'disputed', 'alleged']);

// --- Key Fact ---
export const keyFactSchema = z.object({
  text: z.string(),
  confidenceLevel: confidenceLevelSchema,
});

// --- Primary Source ---
export const primarySourceSchema = z.object({
  type: z.enum(['tweet', 'signal', 'document', 'article', 'court-filing']),
  author: z.string().optional(),
  date: z.string(),
  content: z.string(),
  attribution: z.string(),
  url: z.string().optional(),
});

// --- Chart Config ---
export const chartDataPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export const chartDatasetSchema = z.object({
  label: z.string(),
  color: z.string(),
  data: z.array(chartDataPointSchema),
});

export const chartAnnotationSchema = z.object({
  date: z.string(),
  label: z.string(),
  color: z.string().optional(),
});

export const chartConfigSchema = z.object({
  type: z.enum(['line', 'stacked-area', 'bar']),
  title: z.string(),
  dataKey: z.string(),
  datasets: z.array(chartDatasetSchema),
  yAxisLabel: z.string().optional(),
  annotations: z.array(chartAnnotationSchema).optional(),
});

// --- Decision Fork ---
export const decisionOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  consequence: z.string(),
  isActual: z.boolean(),
});

export const decisionForkSchema = z.object({
  prompt: z.string(),
  context: z.string(),
  options: z.array(decisionOptionSchema),
});

// --- Chapter ---
export const chapterSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: z.string(),
  subtitle: z.string(),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
  narrative: z.string(),
  keyFacts: z.array(keyFactSchema),
  primarySources: z.array(primarySourceSchema),
  chartConfig: chartConfigSchema.optional(),
  decisionFork: decisionForkSchema.optional(),
});

export const chaptersArraySchema = z.array(chapterSchema);

// --- Timeline Event ---
export const eventCategorySchema = z.enum([
  'corporate', 'trading', 'regulatory', 'media',
  'market', 'onchain', 'trial', 'personal', 'political', 'influence',
]);

export const sourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().optional(),
  type: z.enum(['court-filing', 'news-article', 'tweet', 'signal-message', 'document', 'onchain', 'testimony']),
  date: z.string().optional(),
  confidenceLevel: confidenceLevelSchema,
});

export const timelineEventSchema = z.object({
  id: z.string(),
  date: z.string(),
  endDate: z.string().optional(),
  title: z.string(),
  description: z.string(),
  category: eventCategorySchema,
  confidenceLevel: confidenceLevelSchema,
  moduleLinks: z.array(z.string()),
  people: z.array(z.string()).optional(),
  entities: z.array(z.string()).optional(),
  dollarAmount: z.number().optional(),
  sources: z.array(sourceSchema).optional(),
});

// --- Person ---
export const personCategorySchema = z.enum([
  'inner-circle', 'ftx-team', 'investor', 'political',
  'regulatory', 'legal', 'media', 'celebrity',
]);

export const personSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  legalOutcome: z.string().optional(),
  portraitUrl: z.string().optional(),
  category: personCategorySchema,
});

// --- Entity ---
export const entityTypeSchema = z.enum([
  'exchange', 'trading-firm', 'holding-company', 'subsidiary', 'bank-account', 'other',
]);

export const entitySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: entityTypeSchema,
  jurisdiction: z.string(),
  incorporationDate: z.string().optional(),
  dissolutionDate: z.string().optional(),
  parentId: z.string().optional(),
  description: z.string().optional(),
});
