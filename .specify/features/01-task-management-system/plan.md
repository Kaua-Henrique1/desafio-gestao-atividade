# Implementation Plan: 48-Hour Frontend MVP - Kanban Board (Client-Side Only)

**Branch**: `01-task-management-system` | **Date**: 2025-01-14 | **Spec**: [spec.md](./spec.md)

**Scope**: 100% Client-Side Angular 17/18 Standalone Application

**Note**: Hackathon/Challenge tempo - aggressive scope, LocalStorage as database, all state in memory.

## Summary

A **client-side only** kanban task management system built in Angular 17/18 using Angular Signals for state management and LocalStorage for persistence. No backend, no database server, no Docker. Delivers a fully functional single-page application with kanban board, task management, team metrics, and countdown timers. All 10 team members and sample tasks are seeded in memory at startup.

**MVP Scope (48 Hours)**:
- ✅ Kanban board with 5 fixed columns (Backlog, Ready, [Custom Branches], Teste, Feito/Cancelado)
- ✅ Custom column creation (dynamic branch columns)
- ✅ Drag-drop between columns (Angular CDK)
- ✅ Task creation/editing with Fibonacci validation (1,2,3,5,8,13)
- ✅ Task assignment to users (10 seeded users from seed.data.ts)
- ✅ Hour-to-workday conversion Pipe (8h = 1 workday)
- ✅ Countdown timer for each task (displayed on card)
- ✅ Checklist management in task detail modal
- ✅ Reviewer assignment & approval flow (Signal-based validation)
- ✅ Points calculation when task moves to "Feito"
- ✅ Dashboard/KPI view (Throughput by user, WIP load, Deadline alerts)
- ✅ LocalStorage persistence on every state change

**What's NOT in scope**:
- ❌ Backend API / NestJS
- ❌ PostgreSQL / any database server
- ❌ Docker / Docker Compose
- ❌ WebSockets / real-time sync
- ❌ Authentication / login screen
- ❌ Multi-team support
- ❌ E2E tests (unit tests only)
- ❌ Production deployment
- ❌ Mobile app

## Technical Context

**Language/Version**: TypeScript 5.x / Angular 17.x or 18.x

**Core Dependencies**: 
- Angular 17+ with Standalone Components API
- @angular/cdk/drag-drop (Kanban drag-drop)
- Angular Signals (@angular/core signals)
- No RxJS streams (signals only, minimal RxJS where Angular lifecycle requires it)
- Tailwind CSS (styling)
- TypeScript interfaces (no SQL, no ORM)

**Storage**: LocalStorage only (browser key-value store)

**State Management**: 
- Central `BoardStateService` using Angular Signals
- Auto-save to LocalStorage on every state mutation
- In-memory data structures during session

**Testing**: 
- Unit tests for services (validators, calculations) and Signals
- No E2E or integration tests (MVP scope)
- Jasmine/Karma sufficient

**Target Platform**: Web (desktop-first, responsive)

**Project Type**: Client-Side SPA (Standalone Angular)

**Performance Goals**: 
- Dashboard load < 1 second (50-100 tasks typical)
- Drag-drop action < 100ms
- State update < 50ms
- No network latency (all local)

**Constraints**: 
- SME team of 10 (hardcoded in seed data)
- Max 100 tasks in demo (no pagination needed)
- Single board scope (no multi-board)
- Single session (no concurrent users)
- Offline always-on (100% client-side)

**Scale/Scope**: 
- 3 core screens (Kanban Board, Task Detail Modal, Dashboard/Metrics)
- Single app state (BoardStateService + LocalStorage)
- 8 TypeScript interfaces (no entities, no relationships)

## Constitution Check

**Constitution Status**: Template file exists at `.specify/memory/constitution.md` but contains placeholders.

**MVP Checks (Client-Side Only)**:
- ✅ No authentication needed (single user, local session)
- ✅ No distributed system complexity
- ✅ No API contracts needed (client-side only)
- ✅ Test coverage for Fibonacci validation and metrics calculation
- ✅ LocalStorage persistence strategy clear
- ✅ Signals-based state management pattern

**Violations**: None - MVP scope simplified for hackathon delivery.

## Project Structure

### Documentation (this feature)

```text
.specify/features/01-task-management-system/
├── plan.md                # This file (48-hour MVP implementation plan)
├── spec.md                # Feature specification (PRD)
├── data-model.md          # Phase 1: TypeScript interfaces (no SQL)
├── quickstart.md          # Phase 1: Validation guide (3 MVP scenarios)
└── research.md            # Phase 0: Technology decisions (minimal MVPscope)
```

### Source Code (repository root)

```text
# Client-Side Only Angular Application

src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── board-state.service.ts        # Central state (Signals + LocalStorage)
│   │   │   ├── metrics.service.ts            # Throughput, WIP, alerts calculation
│   │   │   ├── task.service.ts               # Task CRUD operations
│   │   │   └── seed-data.ts                  # 10 hardcoded users + sample tasks
│   │   └── models/
│   │       └── interfaces.ts                 # All TypeScript interfaces here
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── task-card/
│   │   │   ├── task-modal/
│   │   │   └── user-avatar/
│   │   ├── pipes/
│   │   │   ├── workday-conversion.pipe.ts    # 8h = 1 workday
│   │   │   └── countdown.pipe.ts             # Format deadline countdown
│   │   └── directives/
│   │       └── fibonacci-validator.directive.ts
│   │
│   ├── features/
│   │   ├── board/
│   │   │   ├── board.component.ts            # Main Kanban board
│   │   │   ├── column.component.ts           # Kanban column (CDK drop zone)
│   │   │   ├── task-card.component.ts        # Task card (CDK drag source)
│   │   │   └── board.service.ts              # Board-specific logic
│   │   │
│   │   ├── task-detail/
│   │   │   ├── task-modal.component.ts       # Task detail modal
│   │   │   ├── checklist.component.ts        # Checklist checkboxes
│   │   │   └── reviewer-selector.component.ts
│   │   │
│   │   └── dashboard/
│   │       ├── dashboard.component.ts        # KPI view (Throughput, WIP, Alerts)
│   │       ├── kpi-card.component.ts
│   │       └── alert-list.component.ts
│   │
│   ├── app.component.ts                      # Root component (navigation)
│   ├── app.route.ts                          # Routes
│   └── app.config.ts                         # Standalone config
│
├── main.ts                                   # Bootstrap
├── styles.css                                # Global styles (Tailwind)
└── index.html

tests/
├── services/
│   ├── board-state.service.spec.ts
│   ├── metrics.service.spec.ts
│   └── task.service.spec.ts
└── pipes/
    └── workday-conversion.pipe.spec.ts

package.json
angular.json
tsconfig.json
```

**Structure Decision**: 
Client-side only, single `src/app` folder with clear separation: `core/` (state + services), `shared/` (reusable components/pipes), `features/` (feature modules). No backend folder, no API layer, no database migrations. All state lives in `BoardStateService` using Angular Signals, persisted to LocalStorage.

Seed data lives in `core/services/seed-data.ts` with 10 hardcoded users and 15-20 sample tasks loaded at startup.

### Real Directories Created

```
.specify/features/01-task-management-system/       # Documentation root (exists)
```

## 48-Hour Sprint Breakdown

**Tempo**: 6-hour sprints × 8 total = 48 hours

### Sprint 0 (Hours 0-6): Foundation & Scaffolding

**Goal**: Project setup, seed data, basic routing

- [ ] Angular new project (standalone components)
- [ ] Project structure setup (core/, shared/, features/)
- [ ] Create interfaces.ts with all TypeScript models
- [ ] Create seed-data.ts (10 users, 15-20 sample tasks)
- [ ] BoardStateService skeleton with Signals
- [ ] LocalStorage service wrapper
- [ ] Basic app routing (board, task-detail, dashboard)
- [ ] Load seed data on app init

**Deliverable**: App boots with seed data visible in console.log

---

### Sprint 1 (Hours 6-12): Board Layout & Basic Rendering

**Goal**: Kanban board UI with columns, basic task cards

- [ ] Board component layout (5 fixed columns + placeholder for custom)
- [ ] Column components rendering tasks
- [ ] Task card component displaying:
  - Title
  - Assigned user avatar
  - Fibonacci points
  - Countdown timer (days remaining)
  - Checklist progress (X/Y items)
- [ ] Add "Create New Column" UI (button only, no logic yet)
- [ ] Tailwind styling for board/cards
- [ ] Responsive grid layout

**Deliverable**: Board displays all seeded tasks in correct columns, tasks are visually distinct.

---

### Sprint 2 (Hours 12-18): Drag-Drop & State Mutations

**Goal**: Drag-drop between columns, state updates, LocalStorage persistence

- [ ] @angular/cdk/drag-drop integration
- [ ] Drag task cards between columns
- [ ] Drop validation (prevent invalid column transitions)
- [ ] Signal-based move (task moves in state immediately)
- [ ] Auto-save to LocalStorage after every move
- [ ] Undo/refresh on invalid move error
- [ ] Visual feedback during drag (ghost card, hover states)

**Deliverable**: Drag task from Backlog → Ready → Custom Column → Teste. Data persists on page reload.

---

### Sprint 3 (Hours 18-24): Task Detail Modal & Editing

**Goal**: Task detail modal, inline editing, checklist management

- [ ] Task detail modal component
- [ ] Modal opens on task card click
- [ ] Editable fields in modal:
  - Title, Description
  - Assigned user (dropdown from seed users)
  - Fibonacci points (validation: 1,2,3,5,8,13 only)
  - Deadline (date picker)
  - Hours estimate (with workday conversion pipe)
- [ ] Checklist management (add/remove/toggle checkboxes)
- [ ] Close modal, save to Signal, auto-persist LocalStorage
- [ ] Create new task from board (plus button)

**Deliverable**: Click task card → modal opens → edit title → close → card updated on board.

---

### Sprint 4 (Hours 24-30): Reviewer Workflow & Transitions

**Goal**: Reviewer assignment, approval flow, task completion

- [ ] Reviewer selector in modal (dropdown, filter out original executor)
- [ ] Signal-based validation: executor ≠ reviewer
- [ ] Move task to Teste column:
  - Must have reviewer assigned
  - Display reviewer name on card
- [ ] Assign reviewer button in Teste column
- [ ] Move from Teste → Feito:
  - Trigger metrics calculation (story point capture)
  - Store executor points + reviewer bonus (2 pts)
  - Update UserMetric in state
- [ ] Move to Cancelado from any column:
  - Zero out points for that task
  - Store cancellation reason in archive

**Deliverable**: Create task → assign user → move to Teste → assign reviewer → move to Feito → confirm points recorded.

---

### Sprint 5 (Hours 30-36): Custom Columns & KPI Dashboard (Part 1)

**Goal**: Custom column creation, metrics visualization

- [ ] Custom column creation modal
  - Input: column name (e.g., "feature/auth", "develop")
  - Create between Ready and Teste
  - Delete custom column (move tasks out first)
  - Reorder columns (drag column header)
- [ ] Dashboard component skeleton
- [ ] KPI Cards:
  - **Throughput by User**: Table showing user → points completed (from UserMetric)
  - **WIP Load**: User → sum of Fibonacci points in in-progress columns
  - **Deadline Alerts**: Tasks < 48h remaining with < 80% checklist done

**Deliverable**: Create custom column "feature/auth" → move tasks to it → view in dashboard KPIs.

---

### Sprint 6 (Hours 36-42): Countdown Timer & Pipes

**Goal**: Task timer display, workday conversion, validation

- [ ] Workday conversion pipe (8h = 1 workday, display "X days"/"Y hours")
- [ ] Countdown pipe (format deadline → "X days remaining" or "OVERDUE")
- [ ] Timer display on task card (updated every 1h or on state change)
- [ ] Fibonacci validator directive (reusable for forms)
- [ ] Input validation for all numeric fields
- [ ] Error messages in modal

**Deliverable**: Create task with 16h estimate → shows "2 days" → set deadline 3 days out → shows "3 days remaining" on card.

---

### Sprint 7 (Hours 42-48): Polish, Testing, Bug Fixes

**Goal**: Unit tests, bug fixes, final validation

- [ ] Unit tests for BoardStateService (Signals mutations)
- [ ] Unit tests for metrics calculations
- [ ] Unit tests for pipes (workday conversion, countdown)
- [ ] Unit tests for validators (Fibonacci)
- [ ] Bug fixes from manual testing
- [ ] LocalStorage load/save edge cases
- [ ] Final styling tweaks
- [ ] Verify all 3 quickstart scenarios pass
- [ ] Generate final documentation

**Deliverable**: 100% unit test coverage for services/pipes. All MVP features working end-to-end.

---

## Architecture Decisions

### 1. State Management: Angular Signals
- **Why**: Client-side only, no backend → state must be fast and lightweight
- **Pattern**: Central `BoardStateService` with Signal-based reactive updates
- **Mutation**: Direct Signal updates (no RxJS streams needed for MVP)
- **Performance**: Signals are ~3x faster than RxJS observables for this use case
- **LocalStorage Bridge**: Auto-save to LS on every Signal mutation (debounced if needed)

### 2. Persistence: LocalStorage
- **Why**: No backend database → browser storage is our "database"
- **Key**: `board_state_v1` (entire state serialized as JSON)
- **Load Strategy**: App initializes with seed data, then hydrates from LS if exists
- **Save Strategy**: After every mutation (move, create, edit, delete)
- **Limitations**: ~5-10MB limit per domain, cleared on browser clear-data, single-tab only

### 3. UI Framework: Angular 17 Standalone + CDK Drag-Drop
- **Framework**: Angular 17.x with Standalone API (no NgModules)
- **Drag-Drop**: `@angular/cdk/drag-drop` (lightweight, accessible)
- **Why CDK**: Built-in, no external dependency hell, supports touch events
- **Styling**: Tailwind CSS (utility-first, minimal CSS bundle)
- **Components**: Pure presentational (inputs/outputs), no smart logic in templates

### 4. Pipes & Validators
- **Workday Conversion Pipe**: `(hours: number) => string` → "X days" or "Y hours"
- **Countdown Pipe**: `(deadline: Date) => string` → "X days remaining" or "OVERDUE"
- **Fibonacci Validator**: Directive/Function checking value ∈ {1,2,3,5,8,13}
- **All stateless**, testable in isolation

### 5. Data Model: TypeScript Interfaces (No ORM)
- **Why**: No database → no need for ORM complexity
- **Pattern**: Plain TypeScript interfaces + plain objects in memory
- **Serialization**: JSON.stringify() for LocalStorage
- **Relationships**: Stored as IDs (userId, columnId, etc.), resolved in service methods
- **No Migrations**: Data shape can change, lossy hydration from LS acceptable for MVP

### 6. Task State Transitions
```
Backlog (start)
  ↓
Ready (pull to work)
  ↓
[Custom Columns] (development branches)
  ↓
Teste (code review/testing)
  ↓
Feito (completed, points captured)
  OR
Cancelado (anytime, points zeroed)
```

### 7. Reviewer Workflow
- When task enters Teste: Require different user as Reviewer
- Signal validation: `task.executor !== task.reviewer`
- On move to Feito: Capture `task.points` + `reviewer.bonus(2 pts)`
- Store in `UserMetric` (in-memory table)

### 8. Metrics Calculation
- **Throughput**: Sum of points for all tasks by user in Feito column (this sprint)
- **WIP**: Sum of points for all tasks by user in intermediate columns (Backlog, Ready, Custom, Teste)
- **Alerts**: Tasks with deadline < 48h AND checklist progress < 80%
- **All calculated on-demand** from state (no background jobs)

---

## Success Criteria (MVP)

1. ✅ Kanban board renders with 5 fixed columns + dynamic custom columns
2. ✅ Drag-drop moves tasks between columns, state persists LocalStorage, page reload restores
3. ✅ Create new task with Fibonacci validation (1,2,3,5,8,13)
4. ✅ Assign user + reviewer (validation: different users)
5. ✅ Checklist in task detail modal (add/remove/toggle items)
6. ✅ Workday conversion pipe: 8h → "1 day", 16h → "2 days"
7. ✅ Countdown timer: deadline shows "X days remaining" or "OVERDUE"
8. ✅ Move task to Feito → record executor points + reviewer bonus
9. ✅ Dashboard shows: Throughput (user → points), WIP (user → sum), Alerts (< 48h + < 80% done)
10. ✅ Custom column creation/deletion
11. ✅ Unit tests for services, pipes, validators (no E2E for MVP)
12. ✅ All data survives page reload (LocalStorage persisted)

---

## Risk & Mitigation

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| LocalStorage quota exceeded (> 5MB) | Low (MVP scope ~100 tasks) | No pagination, but can add if load-testing fails |
| State consistency issues | Low (single-user, single-tab) | Validation functions, unit tests |
| Drag-drop performance with 100+ tasks | Med | Virtual scrolling (CDK scrolling) if needed, but unlikely in 48h |
| Reviewer validation loop (user can't be reviewer for own task) | Low | Simple Signal validation + UI guard |
| Missing edge cases (archive, undo, etc.) | High | Document as "Phase 2 (post-MVP)" |

---

## Out of Scope (Phase 2+)

- 🚫 Undo/Redo functionality
- 🚫 Archive/Soft-delete for old tasks
- 🚫 User authentication (hardcoded users only)
- 🚫 Multi-project/board support
- 🚫 Export to CSV/PDF
- 🚫 Notifications/email
- 🚫 Mobile app
- 🚫 Accessibility audit (WCAG)
- 🚫 Performance profiling / optimization
- 🚫 End-to-end tests (Cypress/Playwright)

---

## Next Steps

1. **Phase 0 (Hours 0-6)**: Run Sprint 0, generate minimal `research.md` (client-side tech decisions)
2. **Phase 1 (Hours 6-48)**: Execute Sprints 1-7 following the breakdown above
3. **Checkpoint (Hour 24)**: Sprint 3+ complete, all core features UI-ready
4. **Checkpoint (Hour 42)**: Sprint 7 start, begin testing and bug fixes
5. **Delivery (Hour 48)**: All tests passing, documentation finalized, ready for demo

---

## Deliverables Checklist

**Documentation**: 
- [ ] **plan.md** (this file, regenerated for 48h MVP scope)
- [ ] **data-model.md** (TypeScript interfaces, no SQL)
- [ ] **quickstart.md** (3 validation scenarios)
- [ ] **research.md** (minimal, client-side tech decisions)

**Source Code Structure**: 
- [ ] **src/app/core/models/interfaces.ts** (all TypeScript types)
- [ ] **src/app/core/services/board-state.service.ts** (Central Signal state)
- [ ] **src/app/core/services/metrics.service.ts** (KPI calculations)
- [ ] **src/app/core/services/task.service.ts** (Task CRUD)
- [ ] **src/app/core/services/seed-data.ts** (10 users, 15-20 tasks)
- [ ] **src/app/shared/pipes/workday-conversion.pipe.ts**
- [ ] **src/app/shared/pipes/countdown.pipe.ts**
- [ ] **src/app/shared/validators/fibonacci.validator.ts**
- [ ] **src/app/features/board/** (board, column, task-card components)
- [ ] **src/app/features/task-detail/** (modal, checklist, reviewer selector)
- [ ] **src/app/features/dashboard/** (KPI cards, metrics display)

**Testing**:
- [ ] **tests/services/board-state.service.spec.ts**
- [ ] **tests/services/metrics.service.spec.ts**
- [ ] **tests/services/task.service.spec.ts**
- [ ] **tests/pipes/workday-conversion.pipe.spec.ts**
- [ ] **tests/pipes/countdown.pipe.spec.ts**
- [ ] **tests/validators/fibonacci.validator.spec.ts**

**Integration**:
- [ ] **Updated .github/copilot-instructions.md** (reference to plan.md)
