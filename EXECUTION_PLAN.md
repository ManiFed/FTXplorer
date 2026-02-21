# FTXplorer — UI Framework & Feature Architecture Plan

## Objective
Build the **complete application framework, design system, navigation shell, and feature surfaces** for all modules without implementing or revising factual/content datasets. This plan is intentionally UI-first and infrastructure-first.

## Core Product Rules
- Complexity Mode (`Beginner / Researcher / Expert`) changes **presentation only**.
- Play vs Explore is a global UX mode, not a data partition.
- Global persistent controls appear in every route:
  - Master Timeline Scrubber
  - Complexity Mode Toggle
  - Play/Explore Switcher
  - Cross-Reference Search UI
  - Evidence Confidence Legend
- All module pages are shipped with full component structure and interaction scaffolding, backed by placeholder/mock data contracts.

---

## Tech Foundation
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind + CSS variables (dark navy + muted amber token set)
- **State:** Zustand for global UI state
- **Charts/Graphs:** D3 + Visx wrappers with mock providers
- **Animation:** Framer Motion
- **Data contracts:** Zod schemas + mock repositories
- **Testing:** Vitest + Playwright smoke coverage

---

## Build Strategy (No Content Changes)

### Phase 0 — Platform Shell & Design System
1. App scaffold, route groups, lint/test setup
2. Design tokens (color, typography, spacing, elevation, confidence badges)
3. UI primitives:
   - Button, Tabs, Toggle, Slider, Badge, Tooltip, Drawer, Panel, Table, EmptyState
4. Global layout:
   - Top utility bar (scrubber + search + mode controls)
   - Left module navigation
   - Main workspace canvas
5. Global stores:
   - `uiStore` (theme, sidebar state)
   - `modeStore` (complexity + play/explore)
   - `timelineStore` (global date pointer)

**Deliverable:** a production-ready shell that all modules plug into.

### Phase 1 — Cross-App Interaction Framework
1. Keyboard shortcuts and command palette shell
2. Global filter chips + query state persistence
3. Drawer orchestration system (stackable right panels)
4. Shared comparison layout (single vs split vs multi-panel)
5. Export/share action framework (stub actions)

**Deliverable:** shared interaction architecture reusable by every module.

### Phase 2 — Module Surfaces (All 8 Modules)
Build each module end-to-end as UI/feature scaffolding with mock adapters and empty/content-placeholder states.

#### 1) Collapse Walkthrough
- Chapter rail + progress UI
- Narrative pane shell
- Decision Fork component (static decision contracts)
- Per-mode rendering templates:
  - Beginner: guided cards
  - Researcher: evidence drawer layout
  - Expert: simulation input/output canvas shell
- Completion summary template

#### 2) Master Timeline
- Swimlane viewport shell
- Zoom/pan interaction layer
- Event node component library
- Timeline detail drawer template
- Filter bar + annotation UI shell
- Comparative timeline split-view framework

#### 3) People, Org Chart & Influence Web
- Secondary tab system (`Org Chart / People Graph / Influence Web`)
- Graph canvas container + legend + controls
- Node profile drawer templates
- Relationship filter controls
- Map/panel regions for political and cultural subviews

#### 4) Financial Reconstruction
- Secondary tab system (`4A`–`4E`)
- Chart-stage layout for balance, flow, and exposure screens
- Reusable metric cards + confidence tags
- Estimator input panel shell
- Recovery tracker table framework

#### 5) Trial Explorer
- Secondary tab system (`5A`–`5E`)
- Timeline shell + evidence library grid/table toggle
- Testimony comparison matrix layout
- Charges tracker checklist framework
- Sentencing comparison chart shell

#### 6) Simulation Engine
- Secondary tab system (`6A`–`6D`)
- Scenario picker + parameter controls framework
- Monte Carlo run panel shell (queued/running/completed states)
- Probability/fan-chart output containers
- Scenario comparison workspace

#### 7) FTX Today
- Secondary tab system (`7A`–`7D`)
- Phantom exchange comparison table shell
- Projection badge system (`MODELED PROJECTION`)
- Live panel architecture (polling adapters mocked)
- Counterfactual scenario story panels

#### 8) Bankruptcy & Recovery
- Process tracker flow layout
- Creditor segmentation table + chart shell
- Recovery calculator UI scaffold
- Asset map/list hybrid view framework

**Deliverable:** all routes complete with production-quality UI structure and interactions, using mock providers only.

### Phase 3 — Data & API Adapter Layer (Interface-Only)
1. Define typed interfaces for each module’s required datasets
2. Implement repository pattern:
   - `mockRepository` (active now)
   - `apiRepository` (future, not populated)
3. Add loading/empty/error/skeleton states everywhere
4. Add confidence metadata hooks to every claim-capable component

**Deliverable:** module UIs are data-source-agnostic and ready for later content wiring.

### Phase 4 — Quality, Accessibility, and Responsiveness
1. Responsive behavior across desktop/tablet/mobile breakpoints
2. Accessibility pass:
   - keyboard navigation
   - focus management
   - aria labels
   - contrast checks
3. Motion tuning and reduced-motion support
4. Performance pass on graph-heavy screens

**Deliverable:** accessible, responsive, and performant UX framework.

### Phase 5 — Testing & Release Readiness
1. Unit tests for global stores and key UI primitives
2. Integration tests for route rendering + mode switching
3. Playwright smoke suite for all 8 module routes
4. Visual regression baseline for core layouts
5. CI pipeline gates (lint, typecheck, tests)

**Deliverable:** stable framework release candidate.

---

## Route Map (Framework)
- `/walkthrough`
- `/timeline`
- `/people`
- `/financial`
- `/trial`
- `/simulation`
- `/ftx-today`
- `/bankruptcy`

All routes share the same global shell and support the global controls.

---

## Definition of Done
The project is complete for this scope when:
1. Every module route exists with polished, navigable UI and feature scaffolding.
2. Complexity Mode + Play/Explore switching works globally.
3. Timeline scrubber and global filters propagate through module UIs.
4. Each major feature has interactive controls, placeholders, and state handling.
5. No factual/content expansion is required to validate UX completeness.
