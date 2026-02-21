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
