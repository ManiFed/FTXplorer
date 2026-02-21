'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  collapseMoment,
  influenceEdges,
  influenceNodes,
  type CollapseState,
  type EvidenceConfidence,
  type InfluenceCategory,
  type InfluenceEdge,
  type InfluenceNode,
  type InfluenceRing,
  type RelationshipType,
} from '@/lib/data/influenceGraph';

type Mode = 'static' | 'ripple';

type Preset = 'all' | 'sports' | 'ea' | 'regulatory' | 'media';

const categoryColors: Record<InfluenceCategory, string> = {
  financial: '#2dd4bf',
  institutional: '#818cf8',
  cultural: '#f472b6',
  political: '#f97316',
  academic: '#22c55e',
  regulatory: '#ef4444',
};

const collapseColors: Record<CollapseState, string> = {
  neutral: '#e5e7eb',
  lost_connection: '#6b7280',
  legal_action: '#ef4444',
  returned_funds: '#f59e0b',
  reputational_damage: '#ec4899',
  ongoing_litigation: '#ef4444',
};

const confidenceDash: Record<EvidenceConfidence, string> = {
  high: 'none',
  medium: '2 2',
  low: '5 3',
  disputed: '1 4',
};

const rings: InfluenceRing[] = [1, 2, 3, 4];

const relationshipTypes = Array.from(new Set(influenceEdges.map((edge) => edge.relationship_type)));

function isActive(start: string, end: string, date: Date) {
  const time = date.getTime();
  return new Date(start).getTime() <= time && time <= new Date(end).getTime();
}

function formatAmount(amount: number | null) {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1, style: 'currency', currency: 'USD' }).format(amount);
}

function getCollapseState(node: InfluenceNode, date: Date): CollapseState {
  const sorted = [...node.collapse_timeline].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  return sorted.reduce<CollapseState>((current, item) => {
    if (new Date(item.date).getTime() <= date.getTime()) {
      return item.state;
    }
    return current;
  }, 'neutral');
}

interface Point {
  x: number;
  y: number;
}

function buildPositions(nodes: InfluenceNode[], width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  const ringRadius: Record<InfluenceRing, number> = { 1: 120, 2: 200, 3: 280, 4: 360 };
  const byRing = new Map<InfluenceRing, InfluenceNode[]>();
  rings.forEach((ring) => byRing.set(ring, []));
  nodes.forEach((node) => byRing.get(node.influence_ring)?.push(node));

  const points: Record<string, Point> = { sbf: { x: cx, y: cy } };
  rings.forEach((ring) => {
    const ringNodes = byRing.get(ring) ?? [];
    ringNodes.forEach((node, index) => {
      if (node.id === 'sbf') return;
      const angle = (Math.PI * 2 * index) / Math.max(1, ringNodes.length) + ring * 0.2;
      const jitter = (index % 2 === 0 ? -1 : 1) * 14;
      points[node.id] = {
        x: cx + Math.cos(angle) * (ringRadius[ring] + jitter),
        y: cy + Math.sin(angle) * (ringRadius[ring] + jitter),
      };
    });
  });

  return { points, ringRadius, center: { cx, cy } };
}

export function InfluenceWeb() {
  const viewDate = useAppStore((s) => s.viewDate);
  const setViewDateStore = useAppStore((s) => s.setViewDate);

  const [mode, setMode] = useState<Mode>('static');
  const [selectedNode, setSelectedNode] = useState<InfluenceNode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<InfluenceCategory | 'all'>('all');
  const [selectedRing, setSelectedRing] = useState<InfluenceRing | 'all'>('all');
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipType | 'all'>('all');
  const [selectedConfidence, setSelectedConfidence] = useState<EvidenceConfidence | 'all'>('all');
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [preset, setPreset] = useState<Preset>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (mode !== 'ripple') setIsPlaying(false);
  }, [mode]);

  useEffect(() => {
    if (!isPlaying || mode !== 'ripple') return;
    const start = new Date('2022-06-01').getTime();
    const end = new Date('2023-03-01').getTime();
    const id = window.setInterval(() => {
      const candidate = viewDate.getTime() + 1000 * 60 * 60 * 24 * speed * 8;
      setViewDateStore(new Date(candidate > end ? start : candidate));
    }, 140);
    return () => window.clearInterval(id);
  }, [isPlaying, mode, setViewDateStore, speed, viewDate]);

  const activeNodes = useMemo(() => {
    return influenceNodes.filter((node) => {
      const presetMatch =
        preset === 'all' ||
        (preset === 'sports' && node.type === 'athlete') ||
        (preset === 'ea' && node.category === 'academic') ||
        (preset === 'regulatory' && (node.category === 'regulatory' || node.category === 'political')) ||
        (preset === 'media' && node.type === 'media outlet');
      return (
        isActive(node.start_date, node.end_date, viewDate) &&
        presetMatch &&
        (selectedCategory === 'all' || node.category === selectedCategory) &&
        (selectedRing === 'all' || node.influence_ring === selectedRing) &&
        (selectedConfidence === 'all' || node.evidence_confidence === selectedConfidence) &&
        (node.financial_value === null || node.financial_value >= minimumAmount)
      );
    });
  }, [minimumAmount, preset, selectedCategory, selectedConfidence, selectedRing, viewDate]);

  const nodeIds = useMemo(() => new Set(activeNodes.map((node) => node.id)), [activeNodes]);

  const activeEdges = useMemo(() => {
    return influenceEdges.filter((edge) => {
      return (
        nodeIds.has(edge.source_id) &&
        nodeIds.has(edge.target_id) &&
        isActive(edge.start_date, edge.end_date, viewDate) &&
        (selectedRelationship === 'all' || edge.relationship_type === selectedRelationship) &&
        (selectedConfidence === 'all' || edge.evidence_confidence === selectedConfidence) &&
        (edge.financial_amount === null || edge.financial_amount >= minimumAmount)
      );
    });
  }, [minimumAmount, nodeIds, selectedConfidence, selectedRelationship, viewDate]);

  const { points, ringRadius, center } = useMemo(() => buildPositions(activeNodes, 980, 760), [activeNodes]);

  const selectedDateLabel = viewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const selectedNodeEdges = useMemo(() => {
    if (!selectedNode) return [];
    return influenceEdges.filter((edge) => edge.source_id === selectedNode.id || edge.target_id === selectedNode.id);
  }, [selectedNode]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-heading-1 font-bold text-text-primary">Influence Web & Collapse Ripple Visualizer</h1>
          <p className="text-body text-text-secondary">Influence map (not causation map) • date synced to global scrubber • {selectedDateLabel}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button className={`px-3 py-1 rounded ${mode === 'static' ? 'bg-accent-amber text-black' : 'bg-bg-tertiary'}`} onClick={() => setMode('static')}>Static</button>
          <button className={`px-3 py-1 rounded ${mode === 'ripple' ? 'bg-accent-amber text-black' : 'bg-bg-tertiary'}`} onClick={() => setMode('ripple')}>Ripple</button>
          {mode === 'ripple' && (
            <>
              <button className="px-3 py-1 rounded bg-bg-tertiary" onClick={() => setIsPlaying((v) => !v)}>{isPlaying ? 'Pause' : 'Play'}</button>
              <label className="flex items-center gap-1">Speed
                <input type="range" min={0.5} max={4} step={0.5} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
              </label>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        <div className="rounded-lg border border-border bg-bg-secondary p-3 overflow-auto">
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <select className="bg-bg-tertiary rounded px-2 py-1" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as InfluenceCategory | 'all')}>
              <option value="all">All categories</option>
              {Object.keys(categoryColors).map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select className="bg-bg-tertiary rounded px-2 py-1" value={String(selectedRing)} onChange={(e) => setSelectedRing(e.target.value === 'all' ? 'all' : Number(e.target.value) as InfluenceRing)}>
              <option value="all">All rings</option>
              {rings.map((ring) => <option key={ring} value={ring}>{`Ring ${ring}`}</option>)}
            </select>
            <select className="bg-bg-tertiary rounded px-2 py-1" value={selectedRelationship} onChange={(e) => setSelectedRelationship(e.target.value as RelationshipType | 'all')}>
              <option value="all">All relationships</option>
              {relationshipTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <select className="bg-bg-tertiary rounded px-2 py-1" value={selectedConfidence} onChange={(e) => setSelectedConfidence(e.target.value as EvidenceConfidence | 'all')}>
              <option value="all">All confidence</option>
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
              <option value="disputed">disputed</option>
            </select>
            <label className="bg-bg-tertiary rounded px-2 py-1">Min $:
              <input className="bg-transparent ml-1 w-24" type="number" value={minimumAmount} onChange={(e) => setMinimumAmount(Number(e.target.value || 0))} />
            </label>
          </div>

          <svg viewBox="0 0 980 760" className="w-full h-auto">
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6 z" fill="#94a3b8" />
              </marker>
            </defs>
            {rings.map((ring) => (
              <g key={ring}>
                <circle cx={center.cx} cy={center.cy} r={ringRadius[ring]} fill="none" stroke="#334155" strokeDasharray="4 6" />
                <text x={center.cx + ringRadius[ring] + 6} y={center.cy} fill="#94a3b8" fontSize="12">Ring {ring}</text>
              </g>
            ))}

            {mode === 'ripple' && [1, 2, 3].map((wave) => (
              <circle
                key={`wave-${wave}`}
                cx={center.cx}
                cy={center.cy}
                r={80 + ((viewDate.getTime() / (1000 * 60 * 60 * 24)) % 140) + wave * 40}
                fill="none"
                stroke="#f59e0b"
                strokeOpacity={0.2}
                strokeWidth={1}
              />
            ))}

            {activeEdges.map((edge) => {
              const source = points[edge.source_id];
              const target = points[edge.target_id];
              if (!source || !target) return null;
              return (
                <line
                  key={edge.id}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={edge.evidence_confidence === 'disputed' ? '#ef4444' : '#94a3b8'}
                  strokeWidth={Math.max(1, (edge.financial_amount ?? 10000000) / 250000000)}
                  strokeDasharray={edge.evidence_confidence === 'disputed' ? '6 6' : isActive(edge.start_date, edge.end_date, viewDate) ? 'none' : '2 4'}
                  markerEnd={edge.directionality === 'directed' ? 'url(#arrow)' : undefined}
                  opacity={0.7}
                />
              );
            })}

            {activeNodes.map((node) => {
              const point = points[node.id];
              if (!point) return null;
              const state = getCollapseState(node, viewDate);
              const r = node.id === 'sbf' ? 20 : Math.max(8, Math.min(18, (node.financial_value ?? 5000000) / 900000000));
              return (
                <g key={node.id} transform={`translate(${point.x}, ${point.y})`} onClick={() => setSelectedNode(node)} className="cursor-pointer">
                  <circle
                    r={r}
                    fill={state === 'neutral' ? '#0f172a' : collapseColors[state]}
                    stroke={categoryColors[node.category]}
                    strokeWidth={2}
                    strokeDasharray={confidenceDash[node.evidence_confidence]}
                    className={state === 'ongoing_litigation' ? 'animate-pulse' : ''}
                  />
                  <text y={-r - 6} textAnchor="middle" fill="#e2e8f0" fontSize="11">{node.name}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-bg-secondary p-3">
            <h3 className="font-semibold mb-2">Sub-panels</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button className="px-2 py-1 bg-bg-tertiary rounded" onClick={() => setPreset('sports')}>Sports & Entertainment</button>
              <button className="px-2 py-1 bg-bg-tertiary rounded" onClick={() => setPreset('ea')}>EA / Longtermism</button>
              <button className="px-2 py-1 bg-bg-tertiary rounded" onClick={() => setPreset('regulatory')}>Academic & Regulatory</button>
              <button className="px-2 py-1 bg-bg-tertiary rounded" onClick={() => setPreset('media')}>Media Archetype</button>
              <button className="px-2 py-1 bg-bg-tertiary rounded col-span-2" onClick={() => setPreset('all')}>Reset</button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-bg-secondary p-3 min-h-[360px]">
            {!selectedNode ? (
              <p className="text-sm text-text-muted">Select a node for detail drawer fields, mini timeline, and local network context.</p>
            ) : (
              <div className="space-y-2 text-sm">
                <h3 className="font-semibold text-text-primary">{selectedNode.name}</h3>
                <p><strong>Category:</strong> {selectedNode.category}</p>
                <p><strong>Influence Ring:</strong> {selectedNode.influence_ring}</p>
                <p><strong>Nature:</strong> {selectedNode.relationship_summary}</p>
                <p><strong>Financial Value:</strong> {formatAmount(selectedNode.financial_value)} ({selectedNode.source_citation})</p>
                <p><strong>Timeline:</strong> {selectedNode.start_date} → {selectedNode.end_date}</p>
                <p><strong>Impact of collapse:</strong> {selectedNode.collapse_impact_type}</p>
                <p><strong>Current status:</strong> {selectedNode.current_status}</p>
                <p><strong>Evidence confidence:</strong> {selectedNode.evidence_confidence}</p>
                <p><strong>Last updated:</strong> {selectedNode.last_updated}</p>
                <div className="mt-2 border border-border rounded p-2">
                  <p className="font-medium mb-1">Mini timeline</p>
                  <div className="h-2 bg-bg-tertiary rounded relative">
                    <span className="absolute h-2 bg-accent-amber rounded" style={{ left: '5%', width: '78%' }} />
                    <span className="absolute top-[-4px] w-[2px] h-4 bg-red-500" style={{ left: '67%' }} title={collapseMoment} />
                  </div>
                  <p className="text-xs text-text-muted mt-1">Entry {selectedNode.start_date} • Collapse {collapseMoment} • Exit {selectedNode.end_date}</p>
                </div>
                <div className="mt-2 border border-border rounded p-2">
                  <p className="font-medium mb-1">Mini network view</p>
                  <ul className="text-xs space-y-1">
                    {selectedNodeEdges.map((edge: InfluenceEdge) => (
                      <li key={edge.id}>{edge.source_id} → {edge.target_id} ({edge.relationship_type}, {edge.evidence_confidence})</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
