export type InfluenceRing = 1 | 2 | 3 | 4;

export type NodeType =
  | 'individual'
  | 'institution'
  | 'political figure'
  | 'media outlet'
  | 'athlete'
  | 'academic org'
  | 'regulator'
  | 'crypto entity';

export type InfluenceCategory =
  | 'financial'
  | 'institutional'
  | 'cultural'
  | 'political'
  | 'academic'
  | 'regulatory';

export type EvidenceConfidence = 'high' | 'medium' | 'low' | 'disputed';

export type CollapseState =
  | 'neutral'
  | 'lost_connection'
  | 'legal_action'
  | 'returned_funds'
  | 'reputational_damage'
  | 'ongoing_litigation';

export type RelationshipType =
  | 'invested_in'
  | 'donated_to'
  | 'sponsored'
  | 'employed_by'
  | 'collaborated_with'
  | 'funded'
  | 'lobbied'
  | 'reported_on'
  | 'advised'
  | 'regulatory_interaction';

export interface InfluenceNode {
  id: string;
  name: string;
  type: NodeType;
  influence_ring: InfluenceRing;
  category: InfluenceCategory;
  financial_value: number | null;
  relationship_summary: string;
  start_date: string;
  end_date: string;
  collapse_impact_type: string;
  current_status: string;
  evidence_confidence: EvidenceConfidence;
  collapse_timeline: Array<{ date: string; state: CollapseState }>;
  source_citation: string;
  last_updated: string;
}

export interface InfluenceEdge {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type: RelationshipType;
  financial_amount: number | null;
  start_date: string;
  end_date: string;
  directionality: 'directed' | 'bidirectional';
  evidence_confidence: EvidenceConfidence;
  source_citation: string;
  last_updated: string;
}

export const collapseMoment = '2022-11-11';

export const influenceNodes: InfluenceNode[] = [
  {
    id: 'sbf',
    name: 'Sam Bankman-Fried',
    type: 'individual',
    influence_ring: 1,
    category: 'financial',
    financial_value: 32000000000,
    relationship_summary: 'Central decision-maker across trading, venture, and political strategy.',
    start_date: '2019-05-01',
    end_date: '2026-12-31',
    collapse_impact_type: 'legal exposure nexus',
    current_status: 'convicted; under appeals process',
    evidence_confidence: 'high',
    collapse_timeline: [
      { date: '2019-05-01', state: 'neutral' },
      { date: '2022-11-12', state: 'legal_action' },
      { date: '2023-10-03', state: 'ongoing_litigation' },
    ],
    source_citation: 'Court filings and trial transcripts',
    last_updated: '2026-01-15',
  },
  {
    id: 'alameda',
    name: 'Alameda Research',
    type: 'crypto entity',
    influence_ring: 1,
    category: 'financial',
    financial_value: 14000000000,
    relationship_summary: 'Primary trading affiliate with intercompany exposure to FTX customer assets.',
    start_date: '2017-10-01',
    end_date: '2022-11-11',
    collapse_impact_type: 'counterparty contagion',
    current_status: 'in bankruptcy estate unwind',
    evidence_confidence: 'high',
    collapse_timeline: [
      { date: '2017-10-01', state: 'neutral' },
      { date: '2022-11-11', state: 'lost_connection' },
    ],
    source_citation: 'Bankruptcy docket schedules',
    last_updated: '2026-01-15',
  },
  {
    id: 'ftx-us',
    name: 'FTX US',
    type: 'crypto entity',
    influence_ring: 1,
    category: 'financial',
    financial_value: 8000000000,
    relationship_summary: 'US operating affiliate used for regulatory positioning and domestic customer growth.',
    start_date: '2020-05-01',
    end_date: '2022-11-11',
    collapse_impact_type: 'operational freeze',
    current_status: 'asset recovery and claims process',
    evidence_confidence: 'high',
    collapse_timeline: [
      { date: '2020-05-01', state: 'neutral' },
      { date: '2022-11-12', state: 'lost_connection' },
      { date: '2023-07-01', state: 'returned_funds' },
    ],
    source_citation: 'Debtor statements',
    last_updated: '2026-01-15',
  },
  {
    id: 'sequoia',
    name: 'Sequoia Capital',
    type: 'institution',
    influence_ring: 2,
    category: 'institutional',
    financial_value: 213500000,
    relationship_summary: 'Lead investor in major FTX fundraising rounds.',
    start_date: '2021-07-20',
    end_date: '2022-11-11',
    collapse_impact_type: 'mark-to-zero write-down',
    current_status: 'portfolio loss recognized',
    evidence_confidence: 'high',
    collapse_timeline: [
      { date: '2021-07-20', state: 'neutral' },
      { date: '2022-11-12', state: 'lost_connection' },
    ],
    source_citation: 'Fund LP letters',
    last_updated: '2026-01-15',
  },
  {
    id: 'paradigm',
    name: 'Paradigm',
    type: 'institution',
    influence_ring: 2,
    category: 'institutional',
    financial_value: 278000000,
    relationship_summary: 'Large venture investment with post-collapse governance critiques.',
    start_date: '2021-10-21',
    end_date: '2022-11-11',
    collapse_impact_type: 'governance scrutiny',
    current_status: 'exposure written down',
    evidence_confidence: 'high',
    collapse_timeline: [
      { date: '2021-10-21', state: 'neutral' },
      { date: '2022-11-12', state: 'lost_connection' },
    ],
    source_citation: 'Public investor statements',
    last_updated: '2026-01-15',
  },
  {
    id: 'congress',
    name: 'US Congressional Committees',
    type: 'political figure',
    influence_ring: 2,
    category: 'political',
    financial_value: 40000000,
    relationship_summary: 'Donation pathways and policy testimony channels.',
    start_date: '2020-01-01',
    end_date: '2024-12-31',
    collapse_impact_type: 'investigative hearings',
    current_status: 'ongoing policy debate',
    evidence_confidence: 'medium',
    collapse_timeline: [
      { date: '2020-01-01', state: 'neutral' },
      { date: '2022-11-15', state: 'legal_action' },
    ],
    source_citation: 'FEC and hearing records',
    last_updated: '2026-01-15',
  },
  {
    id: 'cftc',
    name: 'CFTC Engagement',
    type: 'regulator',
    influence_ring: 2,
    category: 'regulatory',
    financial_value: null,
    relationship_summary: 'Regulatory meetings around derivatives market structure.',
    start_date: '2021-08-01',
    end_date: '2024-12-31',
    collapse_impact_type: 'enforcement collaboration',
    current_status: 'policy references in new frameworks',
    evidence_confidence: 'medium',
    collapse_timeline: [
      { date: '2021-08-01', state: 'neutral' },
      { date: '2022-11-12', state: 'legal_action' },
      { date: '2023-01-10', state: 'ongoing_litigation' },
    ],
    source_citation: 'Agency calendars and testimonies',
    last_updated: '2026-01-15',
  },
  {
    id: 'miami-heat',
    name: 'Miami Heat Arena Deal',
    type: 'athlete',
    influence_ring: 3,
    category: 'cultural',
    financial_value: 135000000,
    relationship_summary: 'High-visibility naming rights sponsorship amplifying mainstream exposure.',
    start_date: '2021-04-01',
    end_date: '2023-01-12',
    collapse_impact_type: 'branding unwind',
    current_status: 'agreement terminated',
    evidence_confidence: 'high',
    collapse_timeline: [
      { date: '2021-04-01', state: 'neutral' },
      { date: '2022-11-20', state: 'lost_connection' },
      { date: '2023-01-12', state: 'returned_funds' },
    ],
    source_citation: 'Sponsorship contract filings',
    last_updated: '2026-01-15',
  },
  {
    id: 'tom-brady',
    name: 'Tom Brady',
    type: 'athlete',
    influence_ring: 3,
    category: 'cultural',
    financial_value: 30000000,
    relationship_summary: 'Celebrity ambassador and equity-linked promoter.',
    start_date: '2021-06-29',
    end_date: '2024-12-31',
    collapse_impact_type: 'civil litigation exposure',
    current_status: 'named in civil actions',
    evidence_confidence: 'medium',
    collapse_timeline: [
      { date: '2021-06-29', state: 'neutral' },
      { date: '2022-11-15', state: 'legal_action' },
      { date: '2024-01-01', state: 'ongoing_litigation' },
    ],
    source_citation: 'Civil complaint records',
    last_updated: '2026-01-15',
  },
  {
    id: 'effective-altruism',
    name: 'Effective Altruism Network',
    type: 'academic org',
    influence_ring: 3,
    category: 'academic',
    financial_value: 160000000,
    relationship_summary: 'Philanthropic grant pathways tied to longtermist institutions.',
    start_date: '2020-02-01',
    end_date: '2025-12-31',
    collapse_impact_type: 'reputational reset',
    current_status: 'grant governance reforms',
    evidence_confidence: 'medium',
    collapse_timeline: [
      { date: '2020-02-01', state: 'neutral' },
      { date: '2022-11-13', state: 'reputational_damage' },
      { date: '2024-01-01', state: 'returned_funds' },
    ],
    source_citation: 'Foundation disclosures',
    last_updated: '2026-01-15',
  },
  {
    id: 'vox',
    name: 'Major Media Coverage Cluster',
    type: 'media outlet',
    influence_ring: 4,
    category: 'cultural',
    financial_value: null,
    relationship_summary: 'Narrative amplification before collapse and critical reframing after.',
    start_date: '2019-06-01',
    end_date: '2026-12-31',
    collapse_impact_type: 'sentiment inversion',
    current_status: 'high scrutiny historical framing',
    evidence_confidence: 'medium',
    collapse_timeline: [
      { date: '2019-06-01', state: 'neutral' },
      { date: '2022-11-10', state: 'lost_connection' },
    ],
    source_citation: 'Media archive analysis',
    last_updated: '2026-01-15',
  },
  {
    id: 'retail-users',
    name: 'Global Retail Users',
    type: 'institution',
    influence_ring: 4,
    category: 'financial',
    financial_value: 8700000000,
    relationship_summary: 'Customer funds and confidence shock transmission across exchanges.',
    start_date: '2019-05-01',
    end_date: '2026-12-31',
    collapse_impact_type: 'withdrawal contagion',
    current_status: 'claims and partial recoveries',
    evidence_confidence: 'high',
    collapse_timeline: [
      { date: '2019-05-01', state: 'neutral' },
      { date: '2022-11-11', state: 'legal_action' },
      { date: '2025-01-01', state: 'returned_funds' },
    ],
    source_citation: 'Claims process updates',
    last_updated: '2026-01-15',
  },
];

export const influenceEdges: InfluenceEdge[] = [
  {
    id: 'e1',
    source_id: 'sbf',
    target_id: 'alameda',
    relationship_type: 'advised',
    financial_amount: 10000000000,
    start_date: '2019-05-01',
    end_date: '2022-11-11',
    directionality: 'directed',
    evidence_confidence: 'high',
    source_citation: 'Trial evidence exhibits',
    last_updated: '2026-01-15',
  },
  {
    id: 'e2',
    source_id: 'sbf',
    target_id: 'ftx-us',
    relationship_type: 'employed_by',
    financial_amount: null,
    start_date: '2020-05-01',
    end_date: '2022-11-11',
    directionality: 'directed',
    evidence_confidence: 'high',
    source_citation: 'Corporate records',
    last_updated: '2026-01-15',
  },
  {
    id: 'e3',
    source_id: 'sequoia',
    target_id: 'sbf',
    relationship_type: 'invested_in',
    financial_amount: 213500000,
    start_date: '2021-07-20',
    end_date: '2022-11-11',
    directionality: 'directed',
    evidence_confidence: 'high',
    source_citation: 'Fund disclosures',
    last_updated: '2026-01-15',
  },
  {
    id: 'e4',
    source_id: 'paradigm',
    target_id: 'sbf',
    relationship_type: 'invested_in',
    financial_amount: 278000000,
    start_date: '2021-10-21',
    end_date: '2022-11-11',
    directionality: 'directed',
    evidence_confidence: 'high',
    source_citation: 'Investor letter',
    last_updated: '2026-01-15',
  },
  {
    id: 'e5',
    source_id: 'sbf',
    target_id: 'congress',
    relationship_type: 'donated_to',
    financial_amount: 40000000,
    start_date: '2020-01-01',
    end_date: '2022-11-11',
    directionality: 'directed',
    evidence_confidence: 'medium',
    source_citation: 'FEC records',
    last_updated: '2026-01-15',
  },
  {
    id: 'e6',
    source_id: 'sbf',
    target_id: 'cftc',
    relationship_type: 'lobbied',
    financial_amount: null,
    start_date: '2021-08-01',
    end_date: '2022-11-20',
    directionality: 'directed',
    evidence_confidence: 'medium',
    source_citation: 'Meeting logs',
    last_updated: '2026-01-15',
  },
  {
    id: 'e7',
    source_id: 'ftx-us',
    target_id: 'miami-heat',
    relationship_type: 'sponsored',
    financial_amount: 135000000,
    start_date: '2021-04-01',
    end_date: '2023-01-12',
    directionality: 'directed',
    evidence_confidence: 'high',
    source_citation: 'Arena naming records',
    last_updated: '2026-01-15',
  },
  {
    id: 'e8',
    source_id: 'ftx-us',
    target_id: 'tom-brady',
    relationship_type: 'sponsored',
    financial_amount: 30000000,
    start_date: '2021-06-29',
    end_date: '2022-11-11',
    directionality: 'directed',
    evidence_confidence: 'medium',
    source_citation: 'Endorsement filings',
    last_updated: '2026-01-15',
  },
  {
    id: 'e9',
    source_id: 'sbf',
    target_id: 'effective-altruism',
    relationship_type: 'funded',
    financial_amount: 160000000,
    start_date: '2020-02-01',
    end_date: '2022-11-11',
    directionality: 'directed',
    evidence_confidence: 'medium',
    source_citation: 'Grant records',
    last_updated: '2026-01-15',
  },
  {
    id: 'e10',
    source_id: 'vox',
    target_id: 'sbf',
    relationship_type: 'reported_on',
    financial_amount: null,
    start_date: '2019-06-01',
    end_date: '2026-12-31',
    directionality: 'bidirectional',
    evidence_confidence: 'low',
    source_citation: 'Archive summaries',
    last_updated: '2026-01-15',
  },
  {
    id: 'e11',
    source_id: 'retail-users',
    target_id: 'ftx-us',
    relationship_type: 'collaborated_with',
    financial_amount: 8700000000,
    start_date: '2019-05-01',
    end_date: '2022-11-11',
    directionality: 'directed',
    evidence_confidence: 'high',
    source_citation: 'Customer account snapshots',
    last_updated: '2026-01-15',
  },
];
