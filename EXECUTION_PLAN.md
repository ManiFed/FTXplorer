# FTXplore — Phased Execution Plan

## Tech Stack Decision

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | SSR for SEO on narrative content, API routes for simulation backends, file-based routing maps cleanly to 8 modules |
| Language | **TypeScript** | Non-negotiable for a project this size |
| Styling | **Tailwind CSS + CSS variables** | Dark navy theme (#0d1117), rapid iteration, design token system via CSS vars for the amber accent and confidence dot colors |
| State Management | **Zustand** | Lightweight, handles global state (complexity mode, play/explore toggle, timeline scrubber position) without Redux boilerplate |
| Data Visualization | **D3.js + Visx (React bindings)** | D3 for custom force-directed graphs, Sankey diagrams, and the timeline; Visx for standard charts (line, bar, fan charts) |
| Animation | **Framer Motion** | Chapter transitions, Sankey flow animations, influence web collapse ripple |
| Mapping | **Deck.gl or Mapbox GL** | Political donation map, geographic entity map |
| Simulation (Monte Carlo) | **Web Workers + simple-statistics** | Offload 10K-path simulations to workers to keep UI responsive |
| Database | **PostgreSQL (via Prisma)** | Structured data: entities, people, events, exhibits, claims |
| Search | **Meilisearch** (or Typesense) | Cross-reference search across all modules |
| Auth/Annotations | **NextAuth.js + Prisma** | User accounts for saved annotations, simulation runs, workspace |
| Typography | **Inter (UI) + Lora (long-form)** | Per design spec |
| Testing | **Vitest + Playwright** | Unit tests + E2E for critical flows |

---

## Phase 0: Foundation & Infrastructure (Estimated scope: project scaffold + design system + global shell)

### Goals
- Bootable Next.js app with the complete global shell working
- Design system tokens and core components established
- Data model schema designed and seeded with stub data
- No module content yet — just the empty shell that all modules plug into

### Tasks

#### 0.1 — Project Scaffold
- Initialize Next.js 14 with App Router, TypeScript, Tailwind
- Configure ESLint, Prettier, Vitest, Playwright
- Set up folder structure:
  ```
  src/
    app/                    # Next.js App Router pages
      (shell)/              # Layout group for the global shell
        walkthrough/
        timeline/
        people/
        financial/
        trial/
        simulation/
        ftx-today/
        bankruptcy/
    components/
      shell/                # Global persistent elements
      ui/                   # Design system primitives
      charts/               # Reusable chart components
      modules/              # Module-specific components
    lib/
      store/                # Zustand stores
      data/                 # Data access layer
      simulation/           # Monte Carlo engine
      utils/
    types/                  # Global TypeScript types
    styles/                 # Global CSS, design tokens
  prisma/
    schema.prisma
    seed/
  public/
    data/                   # Static JSON datasets for MVP
  ```

#### 0.2 — Design System & Tokens
- CSS custom properties for the full color palette:
  - `--bg-primary: #0d1117` (dark navy base)
  - `--accent-amber: #d4956a` (desaturated FTX amber)
  - `--confidence-green: #3fb950` / `--confidence-yellow: #d29922` / `--confidence-red: #f85149`
  - Surface colors, text colors, border colors
- Tailwind config extending with custom colors, fonts (Inter + Lora)
- Core UI components:
  - `<ConfidenceDot level="established" | "disputed" | "alleged" />`
  - `<DetailDrawer />` — right-side slide-out panel (reused everywhere)
  - `<Card />`, `<Button />`, `<Toggle />`, `<Slider />`, `<TabBar />`
  - `<Tooltip />` with evidence sourcing support
  - `<Badge />` for "MODELED PROJECTION" labels
  - `<MarkdownRenderer />` for narrative content

#### 0.3 — Global Shell & Persistent Elements
- **Master Timeline Scrubber**: thin draggable bar at top of viewport, always visible. Zustand store holds `viewDate` (Date). Every data-driven component subscribes to this.
- **Complexity Mode Toggle**: `beginner | researcher | expert` — persisted to localStorage + Zustand. Affects presentation layer only.
- **Play / Explore Mode Switcher**: determines whether Module 1 (Walkthrough) or full dashboard is the primary view.
- **Left Sidebar Navigation**: 8 module entries, active state, collapsible on mobile. Order matches the spec.
- **Cross-Reference Search**: search bar in top nav (empty shell — wired up in Phase 5).
- **Evidence Confidence Legend**: accessible from nav, explains 🟢🟡🔴 system.

#### 0.4 — Data Model (Schema Only, Stub Seed)
- Prisma schema for core entities:
  - `Event` (id, date, title, description, category, confidenceLevel, moduleLinks)
  - `Person` (id, name, role, bio, legalOutcome, portraitUrl)
  - `Entity` (id, name, type, jurisdiction, incorporationDate, dissolutionDate, parentId)
  - `Exhibit` (id, title, type, description, sourceUrl, confidenceLevel)
  - `Relationship` (id, fromId, toId, type, startDate, endDate, metadata)
  - `FinancialSnapshot` (id, date, entityId, assets, liabilities, metadata)
  - `WalletAddress` (id, address, chain, entityId, label)
  - `CulturalNode` (id, name, category, relationshipToFTX, dealValue, status)
  - `SimulationRun` (id, userId, forkId, parameters, results, createdAt)
  - `Annotation` (id, userId, targetType, targetId, content, color, isPublic)
- Seed with ~20 stub events, ~15 people, ~10 entities for development

#### 0.5 — Static Data Pipeline (JSON-first for MVP)
- For MVP phases, data lives as curated JSON files in `public/data/`:
  - `events.json`, `people.json`, `entities.json`, `chapters.json`, etc.
- Data access layer (`lib/data/`) abstracts whether data comes from JSON or Prisma — allows migration to DB later without changing component code
- Type-safe data loading with Zod validation

### Deliverable
A running Next.js app with the global shell, sidebar nav, complexity toggle, timeline scrubber (non-functional but present), and design system. Clicking any sidebar module shows a placeholder page. All global state (complexity mode, view date, play/explore) flows through Zustand.

---

## Phase 1: Collapse Walkthrough — Beginner Mode (The "killer feature" MVP)

### Goals
- Complete chapter-based scroll experience for Beginner mode
- 15 chapters with narrative prose, auto-animated charts, primary source callouts, and decision forks
- This is the first thing a visitor sees and the most important single feature for adoption

### Tasks

#### 1.1 — Chapter Data Model & Content Structure
- Define chapter schema: `{ id, number, title, dateRange, narrative (markdown), keyFacts[], primarySources[], chartConfig, decisionFork }`
- Define decision fork schema: `{ prompt, options[{ label, consequence (markdown), isActual: boolean }] }`
- Write content for all 15 chapters (this is the largest content authoring task in the project):
  - Ch 1: Alameda founding & Kimchi premium (2017)
  - Ch 2: FTX founding & Alameda entanglement
  - Ch 3: Bull market ascent — sponsorships, politics, celebrity deals
  - Ch 4: Terra/Luna collapse & the secret cover-up (May 2022)
  - Ch 5: CoinDesk article (Nov 2)
  - Ch 6: CZ tweet (Nov 6)
  - Ch 7: "FTX is fine" (Nov 7)
  - Ch 8: Withdrawal halt (Nov 8)
  - Ch 9: Binance deal collapses (Nov 9)
  - Ch 10: SBF late-night tweets (Nov 10)
  - Ch 11: Bankruptcy filing & the hack (Nov 11)
  - Ch 12: The aftermath weeks
  - Ch 13: The arrest (Dec 2022)
  - Ch 14: The trial (Oct 2023)
  - Ch 15: The verdict & sentencing

#### 1.2 — Walkthrough UI Components
- `<ChapterRenderer />`: full-viewport scroll sections with cinematic transitions (Framer Motion)
- `<NarrativeBlock />`: prose with plain-English styling (Lora font), Evidence Confidence dots inline
- `<PrimarySourceCallout />`: styled card showing a tweet embed, Signal message screenshot, or document excerpt
- `<WhatJustHappened />`: sticky sidebar with bullet-point summary (toggleable)
- `<AutoAnimatedChart />`: chart component that animates to match the chapter's time period. Types needed for Phase 1:
  - Line chart (FTT price, BTC price)
  - Stacked area (balance sheet gap over time)
  - Simple bar (customer deposits vs. available assets)
- `<DecisionFork />`: the choice UI — story pauses, options appear, user picks, consequence reveals, then "what actually happened" reveal, then transition to next chapter
- `<ChapterProgress />`: progress indicator showing which chapter the user is on

#### 1.3 — Walkthrough Summary Screen
- "You've finished the story" end screen:
  - Timeline of key decisions encountered
  - Simple fraud growth visualization
  - Human cost summary (customer losses, employees, contagion)
  - "Explore deeper" CTAs linking to relevant modules

#### 1.4 — Walkthrough ↔ Global Shell Integration
- Play Mode activates the Walkthrough as the primary experience
- The Master Timeline Scrubber syncs with the current chapter's date range
- Complexity Mode toggle is accessible from within the Walkthrough
- Navigation sidebar shows Walkthrough progress

### Deliverable
A fully functional Beginner-mode Collapse Walkthrough that a new user can read from start to finish, making decisions at each fork, and arriving at a summary screen. Charts animate per-chapter. Primary sources are displayed. The experience is polished and emotionally resonant.

---

## Phase 2: Master Timeline + People & Org Chart (Core navigation infrastructure)

### Goals
- The Master Timeline becomes the primary navigation tool for Explore Mode
- People profiles and the Org Chart establish the "who" dimension
- These two modules together make Explore Mode functional

### Tasks

#### 2.1 — Master Timeline
- **Swimlane Timeline Component** (D3-based, custom):
  - Zoomable from full 2017–2024 range down to individual days
  - Togglable swimlanes: FTX Corporate, Alameda Trading, Regulatory, Media, Market Prices, On-Chain, Trial, Personal Timelines, Political Donations, Influence Web
  - Each lane renders event nodes (circles/diamonds by type) positioned by date
  - Nodes are clickable → open `<DetailDrawer />` with event details, confidence dot, related events, mini sparklines
- **Filter Bar**: category, person, confidence level, dollar threshold, outcome type
- **Global Scrubber Sync**: dragging the Master Timeline Scrubber auto-scrolls/zooms the timeline; clicking a timeline event updates the scrubber
- **Seed Data**: curate ~100–150 real events across all lanes for launch (this is a major research/data task)

#### 2.2 — Annotation Mode (Timeline)
- Logged-in users can drop sticky notes on any event or date range
- Color-coded annotations, private/shareable toggle
- Annotation sidebar showing all annotations for current view
- Export annotated timeline as PDF (basic — use html2canvas or similar)

#### 2.3 — People Graph
- Force-directed D3 graph of ~30–50 key individuals
- Node types: inner circle, FTX team, investors, political, regulatory, legal, media
- Relationship edges typed: employed-by, invested-in, reported-to, social, co-signed, donated-to
- Filter by relationship type
- Click node → `<PersonProfileDrawer />`: role, timeline, legal outcome, key quotes, estimated gain/loss, asset recovery status

#### 2.4 — Org Chart
- Zoomable tree/graph of 130+ legal entities (start with ~30 key entities for MVP, expand later)
- Toggle: simplified (major entities) vs. full legal entity view
- Each entity node: jurisdiction, bank accounts, wallet addresses, responsible person
- Time-scrubbable: entities appear/disappear based on global `viewDate`
- Problematic entities visually distinguished (red border or similar)

#### 2.5 — Political Donation Map
- US choropleth map showing donation totals by state
- Top recipient bar chart
- Donation timeline with pre-midterm acceleration visible
- Ryan Salame plea deal cross-reference
- Data: ~$70M in political donations, well-documented in court records

### Deliverable
Explore Mode is now usable. Users can navigate the full timeline, filter events, explore people and their relationships, browse the org chart, and see political donations. The Detail Drawer pattern is established and reused.

---

## Phase 3: Financial Reconstruction Dashboard (The analytical core)

### Goals
- All five financial sub-sections functional
- This is the most data-intensive module — requires careful sourcing from court filings

### Tasks

#### 3.1 — Balance Sheet Reconstruction (4A)
- Animated balance sheet: assets (left) vs. liabilities (right), red gap zone growing over time
- Scrubable via global timeline
- Each line item expandable with confidence breakdown + source citations
- **Hole Visualizer**: Sankey diagram (D3-sankey) showing where customer money went
  - Nodes: Alameda losses (by category), political donations, real estate, investments, unaccounted
  - All nodes clickable → linked to trial exhibits
- **Solvency Timeline**: line chart with annotated events showing solvency ratio over time

#### 3.2 — Alameda P&L (4B)
- Rolling P&L dashboard with estimated NAV line chart
- Position categories as toggleable lines: market-making, arbitrage, directional bets, venture, FTT collateral
- **FTT Circularity Visualizer**: animated circular flow diagram (D3 custom)
  - The self-referential loop: FTX issues FTT → Alameda holds → borrows against → supports price → repeat
  - Date-scrubbable with dollar values at each node
- **Position Graveyard**: table of major losing trades with entry thesis, size, loss, trial quotes

#### 3.3 — Customer Deposit Tracking (4C)
- Sankey flow map: deposits → intermediaries (North Dimension LLC, etc.) → destinations
- **Customer Impact Estimator**: input amount + date → estimated commingling fraction, recovery rate, dollar recovery
- **Recovery Tracker**: data from bankruptcy docket — claims filed, assets recovered, recovery % by class

#### 3.4 — On-Chain Wallet Flow Explorer (4D)
- Force-directed D3 graph of known wallet addresses
- Nodes sized by volume, edges colored by direction
- Address search with shortest-path calculation to core wallets
- **Animated bank run**: November 2022 withdrawal flood visualization
  - The ~$400M hack vs. Bahamian regulator-directed movements distinguished

#### 3.5 — Sam Coins Tracker (4E)
- Per-token panels: FTT, MAPS, OXY, SRM, SERUM
- Historical price chart per token
- Alameda estimated holdings over time
- Mark-to-market vs. realistic liquidation value
- Collateral illusion gap visualization

### Deliverable
The full financial picture is explorable. Users can see the balance sheet, trace where money went, understand the FTT circularity, explore on-chain flows, and grasp the "Sam Coins" illusion. Every claim is sourced with confidence dots.

---

## Phase 4: Trial Explorer + Walkthrough Researcher Mode

### Goals
- Complete Trial Explorer module
- Upgrade Walkthrough with Researcher Mode features (annotations, primary source panels, evidence-first decision forks)

### Tasks

#### 4.1 — Trial Timeline (5A)
- Timeline from collapse through sentencing
- Parallel cooperating witness timeline (Caroline, Gary, Nishad, Salame)
- Linked to Master Timeline events

#### 4.2 — Evidence Library (5B)
- Searchable library of trial exhibits by type
- Each exhibit: plain-English summary, confidence rating, connections
- **Exhibit Spotlights**: annotated views of key documents (Caroline's spreadsheet, Signal threads, reconstructed balance sheets)

#### 4.3 — Witness Testimony Analyzer (5C)
- Structured testimony summaries organized by topic
- Side-by-side view filtered by topic with contradictions highlighted
- **Credibility Timeline**: how key figures' public statements evolved pre-collapse → trial

#### 4.4 — Charges & Sentencing (5D + 5E)
- Every count: plain-English description, legal elements, prosecution evidence, defense argument, verdict
- Dropped charges from second indictment explained
- **Sentencing Analysis**: 25 years in context — comparative chart (Madoff, Skilling, etc.)
- Sentencing distribution widget

#### 4.5 — Walkthrough: Researcher Mode Upgrade
- Collapsible "Primary Sources" panel per chapter → links to Evidence Library
- Evidence Confidence dots on every factual claim
- Annotation support per chapter section (save to workspace)
- Decision fork third option: "View the evidence yourself" → side drawer with relevant exhibits

### Deliverable
The Trial Explorer is complete. Researcher Mode walkthrough adds the evidentiary depth layer. Users doing legal or academic work now have a fully sourced, annotatable experience.

---

## Phase 5: Influence Web + Simulation Engine (The ambitious differentiators)

### Goals
- The Influence Web maps FTX's cultural impact (the most novel feature)
- The Simulation Engine enables Monte Carlo "what if" analysis
- Walkthrough Expert Mode ties simulations into the narrative

### Tasks

#### 5.1 — Influence Web Core (3C)
- **Radial Web Graph** (D3 force-directed, custom radial layout):
  - Center: FTX/SBF
  - Ring 1: Direct financial (investors, employees, lenders)
  - Ring 2: Institutional (politicians, regulators, academia, media)
  - Ring 3: Cultural (athletes, celebrities, sports franchises, EA movement)
  - Ring 4 (optional): Second-order effects (legislation, EA funding loss, reputation damage)
- Each node clickable → `<InfluenceProfileDrawer />`: relationship nature, financial value, timeline, collapse impact, current status
- Evidence Confidence dots throughout

#### 5.2 — Influence Web Sub-Panels
- **Sports & Entertainment**: FTX Arena, Brady/Gisele, Curry, Ohtani, Larry David ad — deal values, legal exposure, outcomes
- **EA / Longtermism**: FTX Future Fund grants map, clawbacks, distancing, philosophical debate, MacAskill tracking
- **Academic & Regulatory Capture**: lobbying map, Congressional relationships, research funding (careful confidence labeling)
- **Media Archetype**: before/after sentiment analysis per outlet, "genius founder" narrative tracking

#### 5.3 — Collapse Ripple Visualizer
- Animated web: peak (mid-2022) → post-collapse (2023)
- Nodes gray out (lost connection), turn red (legal action), return neutral (recovered)
- Playable as animation or scrubbable

#### 5.4 — Monte Carlo Simulator (6A)
- **Web Worker simulation engine**: accepts parameter distributions, runs N paths, returns percentile bands
- **Pre-built decision forks** (~8–10): "CZ doesn't tweet", "Binance deal goes through", "Terra doesn't collapse", "Segregated accounts from day one", etc.
- Each fork: input parameter panel (sliders with distributions), Run button, output fan chart + probability table
- **Custom fork builder**: pick date, specify counterfactual action (structured dropdown), set magnitude
- Beginner mode: pre-configured defaults, plain-English outputs
- Expert mode: full parameter access, distribution pickers, raw Monte Carlo output

#### 5.5 — Contagion Spread Modeler (6B)
- Network graph: FTX, Alameda, Celsius, Voyager, BlockFi, Genesis, 3AC, Silvergate, Signature
- SIR-like contagion model with adjustable parameters
- Trigger any node → watch cascade animation (healthy → stressed → failed)
- Historical playback mode
- Systemic risk index

#### 5.6 — Market Impact Simulator (6C)
- Historical OHLCV charts for BTC, ETH, FTT, SOL
- Event attribution: factor model decomposing moves into fundamental/contagion/forced-liquidation/panic
- Counterfactual price path: "where would BTC be without FTX" with confidence intervals

#### 5.7 — Regulatory Scenarios (6D)
- Pre-built scenarios (~5): proper SEC framework, CFTC jurisdiction, rigorous AML/KYC, Bahamian audit, Voyager acquisition
- Each: rule change description, behavior constraint, timeline impact, loss impact
- Post-FTX regulatory response tracker: MiCA, US proposals, Bahamian reforms

#### 5.8 — Walkthrough: Expert Mode (Monte Carlo Walkthrough)
- Each decision fork becomes a live simulation input panel
- Parameter sliders with distribution pickers
- Run → 10K paths → fan chart + probability histogram + "most likely path" narrative
- Chained simulations: Chapter N output seeds Chapter N+1 starting conditions
- Save/compare/share simulation runs

### Deliverable
The Influence Web reveals FTX's cultural footprint. The Simulation Engine enables genuine "what if" analysis. Expert Mode walkthrough is a chained Monte Carlo model of the entire collapse. These are the features that make FTXplore genuinely novel.

---

## Phase 6: FTX Today + Bankruptcy & Recovery (Completion + Live Data)

### Goals
- The counterfactual "Phantom Exchange" comparison
- Complete Bankruptcy & Recovery dashboard
- Live data integration where applicable

### Tasks

#### 6.1 — Phantom Exchange Dashboard (7A)
- Side-by-side exchange comparison table: Binance, Coinbase, Kraken, OKX, Bybit, Deribit + "FTX (Projected)"
- Three scenario toggles: "Honest FTX", "Collapse Avoided", "Regulatory Compliant Rebuild"
- Metrics: projected volume, market share, token listings, revenue, user base, geographic footprint
- Methodology dropdowns (Expert mode), confidence ranges, "MODELED PROJECTION" badges

#### 6.2 — Market Structure Impact Analyzer (7B)
- Animated Sankey: where FTX's volume went post-collapse
- "FTX's Fingerprint" panel: innovations adopted vs. abandoned by competitors

#### 6.3 — Live Pricing & SOL Impact (7C + 7D partial)
- Backend API routes polling exchange APIs (60s interval)
- Live BTC/ETH/SOL/major altcoin pricing across exchanges
- "FTX Projected Price" column
- SOL Impact sub-panel: price history, FTX/Alameda holdings, crash & recovery, projected "FTX still around" price

#### 6.4 — Competitive Counterfactual Scenarios (7D)
- Three deep scenarios: "FTX Wins", "Slow Burn", "Early Exposure"
- Each: structured narrative, modeled financial outcomes, regulatory assessment, market structure projection

#### 6.5 — Bankruptcy Process Tracker (8A)
- Visual flowchart of Chapter 11 proceedings
- Completed steps solid, future steps dimmed, estimated dates

#### 6.6 — Creditor Claims Explorer (8B)
- Claims visualization: total, by size tier, geographic, priority waterfall
- Recovery calculator: input claim amount + class → estimated recovery under current/best/worst plan

#### 6.7 — Asset Recovery Map (8C)
- All recovered assets: Robinhood shares, real estate, donation clawbacks, foreign recoveries, litigation
- Status per asset (recovered / in litigation / written off)
- Running total

### Deliverable
The platform is feature-complete. All 8 modules are functional. Live data flows for pricing. The Phantom Exchange section provides the unique counterfactual comparison.

---

## Phase 7: Polish, Search, Performance & Launch Readiness

### Goals
- Cross-Reference Search wired up across all modules
- Performance optimization (virtualization, code splitting, lazy loading)
- Comparative Timeline feature
- Media Sentiment Overlay
- Responsive design audit
- Accessibility audit
- Final QA

### Tasks

#### 7.1 — Cross-Reference Search
- Integrate Meilisearch (or Typesense) indexing all events, people, entities, exhibits, chapters
- Search bar in top nav → results grouped by module with quick navigation
- Keyboard shortcut (Cmd+K)

#### 7.2 — Comparative Parallel Timeline
- Split-screen mode: FTX alongside Enron, Madoff, Lehman, Mt. Gox
- Synchronized scrubbing, dimmed comparative lane
- Requires curated event data for each comparison collapse

#### 7.3 — Media Sentiment Overlay
- Toggleable sentiment line chart above timeline swimlanes
- Aggregate sentiment from curated article database
- The pre-collapse positive → November negative cliff visualization

#### 7.4 — Performance
- React virtualization for large lists (timeline events, evidence library)
- Dynamic imports / code splitting per module
- Image optimization, font subsetting
- Web Worker offloading for simulations already done; audit for other heavy computation
- Lighthouse audit targeting 90+ on all metrics

#### 7.5 — Responsive & Accessibility
- Mobile-responsive layouts for all modules (timeline and graphs are the hardest)
- WCAG 2.1 AA compliance audit
- Keyboard navigation for all interactive elements
- Screen reader support for charts (aria-labels, data tables as alternatives)

#### 7.6 — Auth & User Features
- NextAuth.js setup (GitHub + email providers)
- Saved annotations persist to database
- Saved simulation runs persist
- Shareable links for annotated timelines, simulation results
- User workspace/dashboard

#### 7.7 — Final QA & Content Audit
- Every Evidence Confidence dot verified against sources
- All primary source links functional
- Cross-module navigation tested
- Complexity mode transitions tested across all modules
- Load testing for simulation engine

### Deliverable
Production-ready platform. All features functional, performant, accessible, and searchable. Content verified. Ready for public launch.

---

## Dependency Graph (What blocks what)

```
Phase 0 (Foundation)
  ├── Phase 1 (Walkthrough Beginner) ← can start immediately after Phase 0
  ├── Phase 2 (Timeline + People) ← can start immediately after Phase 0
  │     └── Phase 3 (Financial) ← needs Detail Drawer pattern from Phase 2
  │           └── Phase 4 (Trial + Researcher Mode) ← needs financial data structures
  │                 └── Phase 5 (Influence Web + Simulations + Expert Mode)
  │                       └── Phase 6 (FTX Today + Bankruptcy)
  │                             └── Phase 7 (Polish & Launch)
  └── Phase 1 + Phase 2 can be parallelized
```

**Critical path**: Phase 0 → Phase 1 (parallel with Phase 2) → Phase 3 → Phase 5 → Phase 7

**Phases 1 and 2 are parallelizable** — they share no component dependencies beyond the global shell. If working with multiple contributors, these can proceed simultaneously.

**Phase 4 (Trial) and Phase 5 (Influence Web + Simulations) have a soft dependency** — the Researcher Mode walkthrough upgrade in Phase 4 links to the Evidence Library, which is built in Phase 4 itself. But the Simulation Engine in Phase 5 is independent and could theoretically start earlier if the Web Worker infrastructure is set up.

---

## Data Sourcing Strategy (Cross-cutting concern)

Data is the lifeblood of this project. Each phase requires specific datasets:

| Phase | Key Data Needed | Primary Sources |
|---|---|---|
| 1 | Chapter narratives, decision fork content | Court transcripts, CoinDesk/Reuters reporting, SBF's tweets (archived) |
| 2 | 100–150 curated events, 30–50 person profiles, 30+ entity records, political donation records | Bankruptcy filings, FEC records, corporate registries, SEC filings |
| 3 | Balance sheet reconstructions, Alameda trading data, wallet addresses, token price histories | Court Exhibits (especially Ray's first-day declarations), on-chain data (Etherscan/Arkham), CoinGecko/CoinMarketCap APIs |
| 4 | Trial exhibits, witness testimony summaries, charge details | PACER (court records), DOJ press releases, legal analysis articles |
| 5 | Influence relationships, EA grant data, sponsorship deal terms, sentiment corpus | Public reporting, FTX Future Fund records, sports contract reporting, media archives |
| 6 | Live exchange data, bankruptcy docket updates, asset recovery records | Exchange APIs (Binance, Coinbase, etc.), PACER, bankruptcy estate reports |

**Strategy**: Start with curated JSON files per phase. Migrate to database as data volume grows. All data access goes through an abstraction layer so the switch is transparent to components.

---

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Content authoring bottleneck (15 chapters + all event data) | Delays Phase 1 & 2 | Start content writing in parallel with Phase 0 coding |
| Monte Carlo simulation performance | Poor UX in Phase 5 | Web Workers from day one; benchmark with 10K paths early |
| D3 complexity for custom visualizations | Development time | Use Visx for standard charts; reserve D3 for truly custom viz (Sankey, force graph, radial web) |
| Evidence Confidence accuracy | Credibility risk | Establish a sourcing protocol in Phase 0; every dot requires a citation |
| Live data API rate limits | Phase 6 reliability | Cache aggressively; use WebSocket where available; implement fallback to cached data |
| Scope creep in Influence Web | Phase 5 delays | Define MVP node count (50–75 nodes) and expand post-launch |

---

## Original Feature Plan (Reference Often)

Design Philosophy & Core Principles
The platform serves two simultaneous audiences with radically different needs, unified by a single Complexity Mode toggle (Beginner / Researcher / Expert) that persists globally. The critical design insight is that this toggle doesn't gate content — it changes presentation layer only. A beginner and an expert are looking at the same underlying data; the beginner sees a guided narrative with curated defaults, the expert sees every parameter, raw dataset, and confidence interval. A third axis of interaction — Play Mode vs. Explore Mode — cuts across all complexity levels. Play Mode is linear and guided (the Collapse Walkthrough); Explore Mode is the full open dashboard.
Visual language: Dark navy base (#0d1117), muted amber/orange accent (FTX's brand color, deliberately desaturated — present but not celebratory), editorial typography (Inter for UI, Lora for long-form). Every factual claim carries an Evidence Confidence dot (🟢 established fact from court records / on-chain data, 🟡 reported but disputed, 🔴 alleged / contested). This is non-negotiable throughout — it's what makes the platform usable for legal and academic work.
Global persistent elements present on every screen:
* The Master Timeline Scrubber — a thin draggable bar at the very top, always visible, that sets the "view date" for every data-driven element on the page simultaneously
* The Complexity Mode Toggle in the top nav
* The Play / Explore mode switcher
* The Cross-Reference Search (searches across all modules simultaneously)
* Evidence Confidence legend accessible from nav

Navigation Architecture
The left sidebar has eight top-level modules. The order is deliberate — it reflects a natural learning progression while also being the priority order for MVP development:
1. Collapse Walkthrough ← new, elevated to primary entry point 2. Master Timeline 3. People & Influence Web ← org chart + new influence web, merged 4. Financial Reconstruction 5. Trial Explorer 6. Simulation Engine (Monte Carlo, Contagion, Market Impact, Regulatory) 7. FTX Today ← new real-time comparison module 8. Bankruptcy & Recovery
A ninth item, Media & Narrative, is folded into the Influence Web and Timeline as contextual layers rather than a standalone module — this reduces navigation clutter while preserving all the content.

Module 1: The Collapse Walkthrough (New — Elevated to Primary Entry Point)
This is the first thing a new user sees. It is the platform's "onboarding experience" and its most emotionally resonant feature. It differs fundamentally based on Complexity Mode.
Beginner Mode: The Guided Narrative
A cinematic, chapter-based scroll experience — think NYT "Snow Fall" meets an interactive documentary. The user is guided through the collapse as a story with a beginning, middle, and end. There are approximately 15 chapters, each covering a distinct phase:
Chapter 1 covers Alameda's founding (2017) and early arbitrage success — the "Korean Kimchi premium" trades that made Alameda legitimate money and gave SBF his reputation. Chapter 2 covers the FTX founding and the deliberate decision to keep Alameda and FTX intertwined. Chapter 3 covers the bull market ascent — the sponsorships, the political donations, the celebrity deals, the stadium naming rights, the Super Bowl ad. Chapter 4 covers the first cracks — the Terra/Luna collapse in May 2022, Alameda's exposure, and the secret decision to quietly plug the hole with customer funds. Chapters 5 through 12 cover the November 2022 collapse week day by day — November 2nd (CoinDesk article), November 6th (CZ tweet), November 7th (SBF tweet "FTX is fine"), November 8th (withdrawal halt), November 9th (Binance deal collapses), November 10th (SBF's late-night tweets), November 11th (bankruptcy filing and the hack), the weeks after. Final chapters cover the arrest, trial, and verdict.
Each chapter has: a prose narrative with plain-English explanations, auto-animated charts that update to show the relevant financial picture at that moment in the story, primary source callouts (a tweet, a Signal message, a document excerpt), and a "What just happened" sidebar that summarizes the key facts in bullet form for users who want to skim.
Crucially, at the end of each chapter, the user faces a Decision Fork — a stylized moment where the story pauses and asks "What would you have done?" They're presented with 2-3 choices (e.g., at the end of the Terra/Luna chapter: "A) Tell customers and investors the truth, B) Use Alameda funds to quietly fill the gap, C) Raise emergency external capital"). They pick one, see a one-paragraph plain-English consequence narrative, and then the story reveals what SBF actually did and why — before moving to the next chapter. These decision forks are not simulations in Beginner mode — they're curated narrative branches with pre-written outcomes designed to build intuition about why each bad decision compounded the next.
At the end of the Walkthrough, Beginner mode users see a "You've finished the story" summary screen showing: a timeline of the key decisions they encountered, a simple visualization of how the fraud grew over time, the final human cost (customer losses, employees affected, broader crypto contagion), and "Now explore deeper" CTAs that link into specific modules for areas they flagged as interesting during the walkthrough.
Researcher Mode: The Annotated Walkthrough
The same chapter structure, but each chapter has a collapsible "Primary Sources" panel showing every court exhibit, filing, and contemporaneous article that supports the chapter's claims. Every factual claim has an Evidence Confidence dot. Users can annotate any chapter section and save those annotations to their workspace. Decision forks include a third option: "View the evidence yourself" — which opens a side drawer with the relevant exhibits so the user can form their own conclusion before seeing the pre-written consequence.
Expert Mode: The Monte Carlo Walkthrough
This is where the Walkthrough becomes a genuine simulation. The chapter structure remains, but each Decision Fork is now a live Monte Carlo simulation input panel. When the user reaches the Terra/Luna chapter fork, instead of picking from three curated options, they see:
A parameter panel where they can set: the disclosure timeline (how many days/weeks until public disclosure, as a slider), the coverage ratio at time of disclosure (what fraction of the hole is covered by liquid assets, as a slider with a log-normal distribution picker), the market conditions (BTC price range, broader risk sentiment index), and the regulatory response speed (drawn from a distribution calibrated against historical SEC/CFTC response times in analogous cases).
They hit Run and the simulator generates 10,000 paths. The output shows a fan chart of FTT price trajectories, a distribution of customer recovery percentages, a probability histogram of key outcomes (orderly wind-down, disorderly collapse, criminal charges, regulatory settlement), and a "Most likely path" narrative that the simulator generates dynamically based on the median simulation path.
Users can save simulation runs, compare them side-by-side, and share them. Each decision fork's simulation feeds into the next chapter — the starting conditions of Chapter 5's simulation are seeded by the output of Chapter 4's, creating a chained causal model of the entire collapse. By the end of the Walkthrough in Expert mode, the user has built a complete Monte Carlo model of the counterfactual FTX universe they chose to explore.

Module 2: The Master Timeline
The full-width, always-accessible timeline. It anchors all other modules and is the primary navigation tool for non-walkthrough exploration.
Zoomable swimlane timeline covering 2017–2024 with togglable lanes: FTX Corporate Events, Alameda Trading Events, Regulatory Actions, Media Coverage, Market Price Events (BTC/ETH/FTT/SOL price overlay), On-Chain Anomalies, Trial Events, Personal Timelines (SBF, CZ, Caroline, Ryan Salame, Gary Wang, Nishad Singh, and others), Political Donation Events, and the new Influence Web Events lane (cultural moments — stadium naming, Super Bowl ad, celebrity endorsements, EA/longtermism events, media profiles).
Every event node is clickable and opens a Detail Drawer from the right showing: the event in plain English, Evidence Confidence sourcing, all primary source documents, a mini-network of related events, and mini sparklines for relevant financial metrics around that event date.
Filter bar: by category, person, Evidence Confidence level, dollar amount threshold (only show events involving >$X), and outcome type.
Annotation Mode: any user can drop sticky notes on any event or date range, color-code them, mark private or shareable, and export annotated timelines as PDF or shareable link.
Comparative Parallel Timeline: split-screen mode showing the FTX collapse alongside Enron, Madoff, Lehman, or Mt. Gox — synchronized scrubbing, dimmed parallel lane clearly labeled as comparative.
Media Sentiment Overlay: a toggleable line chart that rides above the swimlanes showing aggregate media sentiment from the curated article database (Module 8, now folded in). You can watch the sentiment curve go sharply negative in November 2022 — the visual of how positive it was before is striking.

Module 3: People, Org Chart & Influence Web (Merged)
This module has three sub-sections accessible via a secondary tab bar: Org Chart, People Graph, and Influence Web (new).
3A: The Org Chart
Zoomable, pannable tree/graph of all 130+ legal entities in the bankruptcy estate. Toggle between simplified (major entities only) and full legal entity views. Each entity node shows incorporation jurisdiction, known bank accounts, known wallet addresses, responsible person per trial testimony, and role in the structure.
Time-scrubbable: drag the global scrubber and watch entities appear and disappear as FTX expanded into 40+ countries. Entities that later became problematic (Alameda Research LLC as the vehicle for commingling, North Dimension LLC as the shadow bank account) are visually distinguished.
3B: The People Graph
Force-directed relationship graph of all major individuals and their connections — the inner circle, broader FTX team, investors (Sequoia, Temasek, SoftBank, Ontario Teachers, etc.), political connections, regulatory contacts, legal counsel, media figures.
Each person node opens a Person Profile drawer: role, timeline of involvement, legal outcome (charges / plea / cooperation / conviction / sentence), key quotes from trial testimony, estimated personal financial gain/loss, known asset recovery status.
Relationship edges are typed: employed by, invested in, reported to, social relationship, co-signed on, donated to. A filter by relationship type lets you isolate just the financial connections, or just the political connections, or just the legal outcomes.
Political Donation Map: US map with donation totals by state, top recipient bar chart, timeline of donations (the pre-2022-midterm acceleration), breakdown by party and cause. Cross-referenced with Ryan Salame's plea deal.
3C: The Influence Web (New)
This is the most culturally ambitious feature in the platform. It maps FTX's impact on society and "high culture" — not just finance, but sports, politics, academia, effective altruism, celebrity culture, and media.
The primary visualization is a radial web graph with FTX/SBF at the center and concentric rings representing degrees of influence. The innermost ring is direct financial relationships (investors, employees, lenders). The second ring is institutional influence (political figures who received donations, regulators who interacted with FTX, academic institutions that received EA/longtermism funding, media outlets that ran favorable coverage). The third ring is cultural influence (the athletes and celebrities in FTX deals, the sports franchises, the EA movement, the "genius billionaire" media archetype that FTX exemplified and then shattered). An optional fourth ring shows second-order effects (crypto legislation that was influenced by FTX lobbying, EA projects that lost funding, the general reputation damage to the longtermism movement, the political figures who had to return donations).
Each node in the web is clickable and opens a Influence Profile drawer showing: the nature of the relationship, the financial value of the relationship (where applicable), the timeline (when did FTX enter this sphere, when did they exit), the impact of the collapse on this node, and the current status (did the institution return the money? did the athlete issue a statement? was the legislation killed?). Evidence Confidence dots throughout.
Cultural Impact sub-sections within the Influence Web:
The Sports & Entertainment Panel covers: FTX Arena (Miami Heat — the $135M naming rights deal, the subsequent reversal, what the arena is now called), the Tom Brady/Gisele equity stake and the lawsuit filed against them, Steph Curry's deal and the investor lawsuit, Shohei Ohtani, Naomi Osaka, Trevor Lawrence, the Larry David Super Bowl commercial ("I don't think so" — probably the most ironic ad in Super Bowl history given the timing), the entire FTX-branded merchandise and sponsorship universe. For each: deal value, nature of relationship (paid spokesperson vs. equity holder vs. investor), legal exposure post-collapse, outcome.
The Effective Altruism / Longtermism Panel is one of the most intellectually interesting sections in the entire platform. FTX and SBF were deeply intertwined with the EA movement — the FTX Future Fund disbursed hundreds of millions in grants before going dark, SBF was publicly EA's most prominent benefactor, and the collapse created a crisis of credibility for the movement. This panel shows: a map of EA-affiliated organizations that received FTX Future Fund grants (and the amounts), which grants were clawed back in bankruptcy, which EA institutions distanced themselves from SBF after the collapse, the philosophical debate within EA about whether SBF's "earn to give" philosophy had contributed to his willingness to rationalize fraud, and key essays and responses from EA thought leaders. William MacAskill's position is specifically tracked — he was personally close to SBF and publicly devastated after the collapse.
The Academic & Regulatory Capture Panel tracks FTX's attempted influence over regulatory outcomes — the lobbying for a specific CFTC framework (the "digital commodities" bill that SBF was pushing) that critics said would have kneecapped DeFi competitors, the relationships with specific Congressional staffers and committee members, the donations to both parties' campaigns in proportions calculated to maximize influence on crypto legislation, and the academic economists and policy thinkers who received speaking fees or research funding. This section has particularly careful Evidence Confidence labeling since the "regulatory capture" framing is contested.
The Media Archetype Panel tracks how FTX reshaped the "genius founder" media archetype — the deliberate cultivation of the "disheveled brilliant nerd" image (the cargo shorts, the Toyota Corolla, the beanbag sleeping), how major outlets ran with it uncritically, which journalists wrote the most hagiographic pieces and what they've said since, the "future of finance" / "new Warren Buffett" coverage, and the contrast with the post-collapse coverage. Includes a before/after sentiment analysis for each major outlet that covered FTX extensively.
The Collapse Ripple Visualizer: An animated visualization showing the Influence Web at peak (mid-2022) versus post-collapse (2023), with nodes that lost their FTX connection graying out, nodes where legal action was filed turning red, and nodes that recovered and moved on returning to neutral. You can play this as an animation or scrub through it.

Module 4: Financial Reconstruction Dashboard
Five sub-sections via secondary tab bar.
4A: FTX Balance Sheet Reconstruction
An animated balance sheet scrubable through time. Assets on left, liabilities on right, the gap rendered visually as a red zone that grows. Each line item has an expandable confidence breakdown sourced to specific court filings.
Hole Visualizer: Sankey diagram showing where customer money went — Alameda trading losses (by category: Luna/Terra exposure, leveraged BTC longs, illiquid venture bets, Genesis/Voyager/BlockFi loans), political donations, Bahamian real estate, "investments," unaccounted. All nodes clickable, linking to relevant trial exhibits.
Solvency Timeline: line chart of reconstructed solvency ratio over time, with key events annotated. Shows the estimated date FTX first became technically insolvent (forensic accountants suggested pre-Luna collapse, though contested — 🟡 confidence), the Terra/Luna deterioration, the attempted cover, and the November cliff.
4B: Alameda P&L and Trading Positions
Rolling P&L dashboard with estimated NAV over time. Position categories: market-making revenues, arbitrage profits, directional bets by asset, venture portfolio fair value, FTT collateral value. Each line individually togglable.
FTT Circularity Visualizer: animated circular flow diagram showing the self-referential loop (FTX issues FTT → Alameda holds FTT as collateral → Alameda borrows against FTT from customer funds → FTX supports FTT price → repeat). Dial in any date to see estimated dollar values at each link.
Position Graveyard: table of Alameda's major losing trades — Luna/Terra, leveraged BTC longs, Voyager/BlockFi loans, Genesis exposure. Each row: entry thesis (from testimony), size, entry/exit price, total loss, relevant trial quotes.
4C: Customer Deposit Tracking
Flow map (Sankey) showing deposits by currency from "FTX Customer Deposits" through intermediaries (North Dimension LLC, Alameda accounts, specific identified wallets) to ultimate destinations.
Customer impact estimator: input a hypothetical deposit amount and date → estimated fraction commingled, estimated recovery rate under current bankruptcy plan, dollar value of that recovery.
Recovery Tracker: live-updated from bankruptcy court docket via API — total claims filed, assets recovered, recovery percentage by creditor class, projected timeline.
4D: On-Chain Wallet Flow Explorer
Force-directed D3 graph of known FTX/Alameda wallet addresses. Nodes sized by total volume, edges colored by direction and proportional to volume. Search any address to see if it appears in the FTX/Alameda graph, with shortest-path calculation to core wallets.
Animated timeline: watch the November 2022 bank run unfold in real time on-chain — withdrawal floods from hot wallets, Alameda's desperate asset pulls, and the ~$400M "hack" that moved in the first hours of bankruptcy (with the Bahamian regulator-directed movements labeled separately from the unauthorized hack, given those are distinct events with different Evidence Confidence levels).
4E: The "Sam Coins" Tracker
Per-token panels for FTT, MAPS, OXY, SRM, SERUM: historical price chart, Alameda's estimated holdings over time, implied mark-to-market value vs. realistic liquidation value, and the collateral illusion gap — the phantom wealth these created on Alameda's books. The visual of how much of Alameda's "NAV" was FTT-denominated at peak is one of the most striking charts in the platform.

Module 5: Trial Explorer
5A: The Trial Timeline
Full timeline from the collapse (November 2022) through SBF's arrest in the Bahamas (December 2022), extradition, arraignment, the trial (October 2023), verdict, and sentencing (March 2024). Alongside SBF's case runs the cooperating witness timeline — Caroline, Gary, Nishad, Ryan Salame plea dates and cooperation terms.
5B: The Evidence Library
Searchable library of all publicly available trial exhibits, organized by type: financial documents, communications (texts/Signal messages), expert witness reports, on-chain transaction records. Each exhibit has a plain-English summary, Evidence Confidence rating, and connections to other exhibits.
Exhibit Spotlights for the most important documents: the Caroline Ellison spreadsheet showing Alameda's unlimited negative balance exemption, the reconstructed balance sheets she prepared at SBF's direction, the Signal message threads. Each spotlight has an annotated view with callouts explaining what each section shows.
5C: Witness Testimony Analyzer
Structured summary of every witness's testimony organized by topic. Filter by topic and see what each witness said side-by-side, with contradictions highlighted. Credibility Timeline shows how key figures' public statements evolved from pre-collapse through trial testimony.
5D: Charges & Counts Tracker
Every count in the indictment: plain-English description, legal elements needed to prove, prosecution evidence, defense counter-argument, verdict. Dropped/untried charges from the second indictment explained.
5E: Sentencing Analysis
The 25-year sentence in context — comparative chart of sentences in analogous white-collar cases (Madoff 150 years, Skilling 24 years, etc.), the government's ask vs. what was given, the defense's ask, the judge's stated rationale. Comparative sentencing distribution widget showing the range of sentences in comparable fraud cases.

Module 6: Simulation Engine
Four simulation types, each accessible via secondary tab. In Beginner mode, simulations are pre-configured with sensible defaults and outputs are explained in plain English. In Researcher mode, methodology notes and confidence intervals are visible. In Expert mode, all parameters are exposed and the full Monte Carlo output is available.
6A: Monte Carlo "What If" Simulator
A library of decision fork points — moments where a different choice could have materially changed the outcome. Pre-built forks: "What if SBF hadn't walked away from the Binance deal?", "What if Alameda had unwound FTT gradually?", "What if Terra/Luna hadn't collapsed?", "What if CZ hadn't tweeted?", "What if FTX had implemented segregated customer accounts from day one?", "What if the CFTC had acted on their investigation earlier?", and many more.
Each fork specifies input parameters varied across simulations — in the "CZ doesn't tweet" scenario, you vary the rate of spontaneous customer withdrawals (from historical base rate to elevated bear-market rate), the timeline of any inevitable liquidity crunch, and regulatory response timing. Each parameter has a distribution (normal, log-normal, uniform) that Expert mode users can modify; Beginner users get curated defaults.
Output: fan chart (median path + 10th/90th + 5th/95th percentile bands), probability table (full recovery, partial recovery, insolvency regardless, regulatory intervention before collapse).
Custom decision forks: select a date, specify a counterfactual action (from structured dropdown: raise capital, reduce leverage, change accounting, regulatory disclosure, unwind position, etc.), set magnitude. Simulator propagates effect through causal model.
6B: Contagion Spread Modeler
Network graph of major crypto entities — FTX, Alameda, Celsius, Voyager, BlockFi, Genesis, 3AC, Silvergate, Signature Bank. Nodes sized by customer assets, edges representing financial exposures (loans, deposits, collateral agreements) with thickness proportional to exposure size.
Trigger collapse of any node and watch contagion spread via SIR-like model (parameters: exposure size, liquidation speed, market impact of forced selling). Plays as animation with healthy nodes turning yellow (stressed) then red (failed).
Historical playback shows exactly what happened. Branch into counterfactuals at any point. Systemic risk index at module top shows aggregate customer/creditor losses ($10B+), number of entities that failed within 6 months, aggregate crypto market cap lost.
6C: Market Impact Simulator
Historical OHLCV for BTC, ETH, FTT, SOL, and major altcoins. Event attribution analyzer decomposes any market move during the collapse period into: fundamental crypto market sell-off, FTX-specific contagion, forced Alameda liquidations, and retail panic. Decomposition via factor model estimated from pre-collapse data.
Counterfactual price path: removes FTX from the scenario and estimates where BTC/ETH would be today without the FTX shock — with careful confidence intervals and methodology notes making clear this is a model estimate.
6D: Regulatory Intervention Scenarios
Pre-built scenarios: "What if SEC had approved a proper crypto exchange framework by 2020?", "What if CFTC had jurisdiction over crypto spot markets?", "What if AML/KYC was rigorously enforced on FTX?", "What if Bahamian regulators had conducted a real audit?", "What if the FTX US/Voyager acquisition had gone through?".
Each scenario: what rule/enforcement would have changed, what behavior it would have constrained, estimated timeline impact, estimated customer loss impact. Clearly labeled as model-based estimates.
Global regulatory response tracker: rules actually passed post-FTX (MiCA in Europe, US proposals, Bahamian reforms), effectiveness estimate at preventing an FTX-like collapse if in place earlier.

Module 7: FTX Today — Real-Time Competitive Comparison (New)
This module asks and attempts to answer the most counterfactually interesting question in the platform: if FTX were still operating today, how would it compare to the current crypto exchange landscape?
7A: The Phantom Exchange Dashboard
The primary visualization is a side-by-side exchange comparison table showing current major exchanges (Binance, Coinbase, Kraken, OKX, Bybit, Deribit for derivatives) with a "FTX (Projected)" column rendered in a distinct visual treatment — slightly ghosted, with a clear label that this is a modeled projection, not real data.
The projected FTX metrics are generated using three scenarios (selectable via toggle): "Honest FTX" (assume SBF had built FTX legitimately without the Alameda commingling — projects forward from FTX's legitimate revenue streams), "Collapse Avoided" (assume the November 2022 crisis was navigated via emergency capital raise — projects forward from the point of the near-collapse), and "Regulatory Compliant Rebuild" (assume FTX US had been the primary entity, fully compliant with US regs, and expanded from there).
Metrics compared for each scenario vs. real exchanges:
* Estimated daily trading volume — projected using FTX's historical market share and the growth of crypto trading volumes since 2022
* Estimated spot and derivatives market share — FTX was a major derivatives exchange; the derivatives landscape has shifted significantly since its collapse (Bybit and OKX benefited enormously)
* Token listings — which tokens FTX would likely have listed based on their historical listing pace
* Revenue estimate — using industry-standard fee rate assumptions and projected volume
* User base estimate — projected from FTX's last known user count (~1M+ active users) using industry growth rates
* Geographic footprint — which jurisdictions FTX would likely be licensed in given post-FTX regulatory developments
Each metric has a methodology dropdown (Expert mode) and a confidence range. All projections are clearly labeled with "MODELED PROJECTION" badges.
7B: The Market Structure Impact Analyzer
This section answers: what has actually changed in crypto market structure because FTX is gone?
A market share flow chart (animated Sankey) shows FTX's estimated trading volume at its peak, then traces where that volume went after the collapse — to Binance (which got a significant initial boost despite CZ's role in triggering the run), to Coinbase (which benefited as the "safe, regulated" exchange narrative strengthened), to OKX and Bybit (which absorbed most of the derivatives flow), and to on-chain DEXs (which surged immediately post-FTX as "not your keys, not your coins" sentiment peaked).
A "FTX's Fingerprint" panel shows which specific market innovations FTX pioneered that have since been adopted by competitors or abandoned: the move order type (now standard on Binance), the prediction market products, the portfolio margin system, the tokenized stock trading (mostly abandoned post-FTX for regulatory reasons), the SRM/FTT tokenomics model (mostly discredited), and the FTX Pay payment infrastructure.
7C: Live Pricing & Volume Comparison
A live data panel (updating every 60 seconds via exchange APIs) showing current trading data for BTC, ETH, SOL, and major altcoins across surviving major exchanges. Alongside each row is a "FTX Projected Price" column using a volume-weighted average of current exchanges but adjusted for FTX's historical tendency to have slightly different spreads and liquidity profiles in specific pairs. This is the most "live" element of the platform and would require backend infrastructure polling exchange APIs.
A "SOL Impact" sub-panel deserves special attention — SOL (Solana) was arguably the single asset most affected by FTX's collapse (FTX/Alameda held enormous SOL positions, and the ecosystem was deeply connected to FTX's venture arm). This panel shows SOL's price history, the FTX/Alameda estimated holdings over time, the collapse-period crash (SOL went from ~$38 to ~$10), and the remarkable recovery (SOL hit ATHs in 2024 well above pre-collapse levels). A projected "FTX still around" SOL price is modeled — FTX's SOL holdings would have created enormous sell pressure in a liquidation scenario, so paradoxically some models suggest SOL may be higher today because FTX collapsed when it did rather than later with even larger positions.
7D: The Competitive Counterfactual Scenarios
Three deep-dive scenarios that combine the financial projections with regulatory and market structure analysis:
"FTX Wins" — FTX navigates the crisis, raises emergency capital (modeled after what was actually available — there were real conversations with Binance, with Justin Sun, with Apollo), implements segregated accounts, complies with regulation, and emerges as a reformed but surviving exchange. This scenario models what the crypto exchange landscape looks like in 2026 with a legitimate FTX competing. Coinbase and Kraken lose market share; the US crypto regulatory framework that passed in 2024 is shaped differently by FTX's lobbying presence; the SOL ecosystem is healthier.
"Slow Burn" — The crisis is contained in November 2022 but the underlying insolvency is not fixed. FTX limps along for another 12-18 months before a second, larger collapse triggered by the 2023 banking crisis. Customer losses are larger; more contagion; the SEC gets the regulatory framework it wants.
"Early Exposure" — An earlier version of the CoinDesk leak or an earlier regulator investigation exposes FTX in mid-2022 during the Luna crisis, when the hole is smaller. Customer losses are lower; SBF has more legal room to cooperate; the bankruptcy is more orderly.
Each scenario is presented as a structured narrative with modeled financial outcomes, a regulatory impact assessment, and a market structure projection — all clearly labeled as counterfactual modeling.

Module 8: Bankruptcy & Recovery Dashboard
8A: The Bankruptcy Process Tracker
Visual flowchart of the Chapter 11 proceedings in Delaware — completed steps in solid color, future steps dimmed, estimated dates. Major milestones: first day hearings, claims bar date, plan of reorganization filing, plan confirmation, and distribution.
8B: The Creditor Claims Explorer
Visualization of the creditor universe: total claims filed, claims by size tier (institutional vs. retail), geographic distribution, priority waterfall (secured creditors → administrative expenses → unsecured creditors → equity → subordinated).
Recovery calculator: input a claim amount and class, see estimated recovery under current plan, best-case plan, and worst-case plan. Updated as the bankruptcy plan evolves.
8C: The Asset Recovery Map
All assets recovered by the bankruptcy estate: the Robinhood shares, Bahamian real estate, political donation clawbacks (Ryan Salame cooperation), foreign jurisdiction recoveries, ongoing litigation asset recoveries. Each asset: status (recovered / in litigation / written off) and estimated value. Running total prominently displayed.
