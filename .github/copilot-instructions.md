<!-- SPECKIT START -->
## 48-Hour Frontend MVP: Kanban Task Management (Client-Side Only)

### 🚀 Quick Start

**Scope**: 100% client-side Angular 17/18 Standalone application. No backend, no database server, no Docker.

**Key Files**:
- **Implementation Plan**: `.specify/features/01-task-management-system/plan.md`
  - 48-hour sprint breakdown (8 × 6-hour sprints)
  - Technology choices (Angular Signals, LocalStorage, CDK drag-drop)
  - Architecture patterns (Signal-based state, Tailwind CSS)
  - Success criteria and risk mitigation

- **Data Model**: `.specify/features/01-task-management-system/data-model.md`
  - TypeScript interfaces only (no SQL, no ORM)
  - User, Task, Column, ChecklistItem, UserMetric types
  - LocalStorage schema (board_state_v1 key)
  - Seed data: 10 users + 15-20 sample tasks

- **Research**: `.specify/features/01-task-management-system/research.md`
  - Technology stack decisions
  - Angular Signals vs RxJS rationale
  - Drag-drop library selection (Angular CDK)
  - Metrics calculation patterns

- **Validation Guide**: `.specify/features/01-task-management-system/quickstart.md`
  - 3 end-to-end MVP scenarios
  - Setup instructions (ng serve only)
  - Validation checklists for all features
  - Performance targets

### 📋 MVP Features (48h Deliverables)

1. **Kanban Board** (Sprint 0-1)
   - 5 fixed columns: Backlog, Ready, Teste, Feito, Cancelado
   - Dynamic custom column creation (feature/*, develop, etc.)
   - Angular CDK drag-drop between columns
   - LocalStorage persistence after every move

2. **Task Management** (Sprint 2-3)
   - Task creation/editing with modal
   - Fibonacci point validation (1,2,3,5,8,13 only)
   - Task assignment to 10 seeded users
   - Checklist management (add/remove/toggle items)
   - Countdown timer (deadline countdown display)
   - Workday conversion pipe (8h = 1 day)

3. **Reviewer Workflow** (Sprint 4)
   - Reviewer assignment (different from executor, validated via Signal)
   - Move to Teste requires reviewer
   - Move to Feito captures points:
     - Executor gets task points (1-13)
     - Reviewer gets fixed 2-point bonus
   - Cancelado anytime (zeroes points)

4. **Dashboard/KPIs** (Sprint 5-6)
   - **Throughput by User**: Sum of points in Feito by executor
   - **WIP Load**: Sum of points in in-progress columns (Ready, Custom, Teste) by executor
   - **Deadline Alerts**: Tasks < 48h with < 80% checklist done
   - All metrics updated on-demand (no background jobs)

5. **Validation & Testing** (Sprint 7)
   - Unit tests for services (board-state, metrics, task)
   - Unit tests for pipes (workday-conversion, countdown)
   - Fibonacci validator testing
   - All 3 quickstart scenarios passing

### 🛠 Tech Stack

- **Framework**: Angular 17 Standalone Components
- **State**: Angular Signals (BoardStateService) + LocalStorage
- **Drag-Drop**: @angular/cdk/drag-drop
- **Styling**: Tailwind CSS
- **Testing**: Jasmine/Karma (unit tests only, no E2E)
- **Build**: Angular CLI + Webpack

**NOT Included**:
- ❌ Backend/NestJS
- ❌ Database/PostgreSQL
- ❌ Docker
- ❌ WebSockets/real-time
- ❌ Authentication
- ❌ E2E tests
- ❌ Deployment setup

### 📁 Project Structure

```
src/app/
├── core/
│   ├── services/
│   │   ├── board-state.service.ts    (Central Signal state)
│   │   ├── metrics.service.ts
│   │   ├── task.service.ts
│   │   └── seed-data.ts              (10 users, 15-20 tasks)
│   └── models/
│       └── interfaces.ts              (All TypeScript types)
├── shared/
│   ├── components/ (task-card, task-modal, user-avatar)
│   ├── pipes/      (workday-conversion, countdown)
│   └── validators/ (fibonacci)
├── features/
│   ├── board/      (Kanban board, columns, drag-drop)
│   ├── task-detail/ (Modal, checklist, reviewer-selector)
│   └── dashboard/  (KPI cards, metrics display)
└── app.component.ts
```

### ✅ Success Criteria

1. ✅ Kanban board renders with 5 fixed + N custom columns
2. ✅ Drag-drop works, state persists to LocalStorage
3. ✅ Fibonacci validation (1,2,3,5,8,13 only)
4. ✅ Reviewer workflow (executor ≠ reviewer)
5. ✅ Metrics calculated (Throughput, WIP, Alerts)
6. ✅ All 3 quickstart scenarios passing
7. ✅ Unit tests for services/pipes/validators
8. ✅ App loads < 1s, drag < 100ms

### 🔄 State Management Pattern

```typescript
// BoardStateService example
export class BoardStateService {
  private state = signal<BoardState>({
    users: SEED_USERS,
    columns: FIXED_COLUMNS,
    tasks: SEED_TASKS,
    metrics: []
  });
  
  readonly state$ = this.state.asReadonly();
  
  // Mutations
  moveTask(taskId, toColumnId) {
    this.state.update(s => ({...s, tasks: [...]}));
    this.saveToLocalStorage();
  }
  
  // Calculations
  calculateMetrics() {
    const metrics = calculateThroughput(this.state());
    // ...
  }
}
```

### 📦 Key Implementation Files

**To Create** (in priority order):
1. `src/app/core/models/interfaces.ts` - All TypeScript types
2. `src/app/core/services/seed-data.ts` - 10 users, 15-20 tasks
3. `src/app/core/services/board-state.service.ts` - Central state (Signals)
4. `src/app/features/board/board.component.ts` - Main kanban view
5. `src/app/shared/pipes/workday-conversion.pipe.ts` - 8h → 1 day
6. `src/app/shared/pipes/countdown.pipe.ts` - Deadline countdown
7. Test files for all above

For additional context, see `.specify/features/01-task-management-system/spec.md` (original PRD).
<!-- SPECKIT END -->
