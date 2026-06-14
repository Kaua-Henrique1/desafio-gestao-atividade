# Quickstart: 48-Hour MVP - 3 Validation Scenarios
**Objective**: Verify core MVP features work end-to-end.
**Setup Prerequisites**:
- Node.js 18+ installed
- Angular 17+ CLI installed (`npm install -g @angular/cli`)
- No backend server needed (100% client-side)
---
## Setup
```bash
# 1. Install dependencies
cd /path/to/desafio-gestao-atividade
npm install
# 2. Start dev server
ng serve
# 3. Open browser
# Navigate to http://localhost:4200
```
**Expected on app load**:
- Kanban board renders with 5 columns: Backlog, Ready, Teste, Feito, Cancelado
- 15-20 sample tasks distributed across columns
- 10 team members listed (seed data)
- Dashboard shows KPI metrics
- Data persists to LocalStorage (check DevTools → Application → LocalStorage → `board_state_v1`)
---
## Scenario 1: Task Drag-Drop & Persistence
**Goal**: Drag a task between columns and verify persistence on page reload.
### Steps
1. **View Task**: On Kanban board, find a task in "Backlog" column
   - Example: "Implementar autenticação com JWT"
2. **Drag Task**: Drag the task from "Backlog" → "Ready" column
   - Expected: Task card animates, smooth drag feedback
   - Task appears in "Ready" column
3. **Verify LocalStorage**: Open DevTools (F12)
   - Tab: Application → LocalStorage
   - Key: `board_state_v1`
   - Value: JSON shows task `columnId: "ready"`
4. **Reload Page**: Press F5 to refresh browser
   - Expected: Task still in "Ready" column (persisted from LocalStorage)
   - No tasks lost, state is hydrated
5. **Drag Again**: Move task "Ready" → "Teste"
   - Expected: Smooth transition, card moves to Teste column
   - Task is updated in LocalStorage
### Pass Criteria
- ✅ Tasks drag smoothly between columns
- ✅ Visual feedback during drag (ghost card, hover state)
- ✅ LocalStorage updates after every move
- ✅ Page reload restores task in correct column
- ✅ Multiple drag operations work without errors
---
## Scenario 2: Task Editing, Fibonacci Validation & Reviewer Assignment
**Goal**: Create/edit a task with validation, assign reviewer, move to "Feito".
### Steps
1. **Create New Task**: Click "+" button in any column (e.g., Backlog)
   - Modal opens for new task
2. **Fill Task Details**:
   - Title: "Setup CI/CD pipeline"
   - Description: "Implement GitHub Actions for static analysis"
   - Executor: Select "João Santos" from dropdown
   - Points: Select "8" (Fibonacci validation: only 1,2,3,5,8,13 allowed)
   - Hours Estimate: Enter "16" (displayed as "2 days" via workday pipe)
   - Deadline: Pick date 5 days from today
   - Checklist: Add 3 items
     - "GitHub Actions config created"
     - "Static analysis running"
     - "PR checks passing"
3. **Save Task**: Click "Save"
   - Task appears in Backlog column
   - Card shows: title, executor (João), 8 points, "5 days remaining"
   - Checklist shows "0/3" progress
4. **Transition to Teste**: Drag task to "Teste" column
   - Modal shows "Reviewer Required" message
   - Reviewer field is highlighted red
5. **Assign Reviewer**: Click "Assign Reviewer"
   - Select "Lucia Alves" (different from executor)
   - Validation: System prevents selecting "João Santos" (executor)
   - Reviewer name appears on card
6. **Move to Feito**: Drag task from "Teste" → "Feito"
   - Confirmation: "8 points recorded for João Santos"
   - Reviewer gets "2 bonus points"
   - Card card is now grayed out (completed)
7. **Verify Metrics**: Go to Dashboard
   - "Throughput by User" shows:
     - João Santos: 8 points
     - Lucia Alves: 2 points (reviewer bonus)
   - Task disappears from WIP calculations
### Pass Criteria
- ✅ Modal opens, all fields editable
- ✅ Fibonacci validation: System rejects invalid points (e.g., 4, 7, 9)
- ✅ Workday conversion: 16h → "2 days" (8h = 1 workday)
- ✅ Countdown: Shows "5 days remaining" (deadline - now)
- ✅ Reviewer validation: Executor ≠ Reviewer enforced
- ✅ Metrics update: Executor + Reviewer points recorded
- ✅ LocalStorage persists all changes
---
## Scenario 3: Custom Column Creation & Dashboard KPIs
**Goal**: Create custom column, view KPIs for throughput, WIP, and deadline alerts.
### Steps
1. **Create Custom Column**: Look for "Create New Column" button
   - Click button, modal opens
   - Input: "feature/payment"
   - Column added between "Ready" and "Teste"
2. **Move Tasks to Custom Column**:
   - Drag 2-3 tasks from "Ready" → "feature/payment"
   - Tasks appear in new custom column
   - Board now shows 6 columns (5 fixed + 1 custom)
3. **Add More Columns**: Repeats steps 1-2
   - Create "develop" column
   - Move tasks to it
   - Board now has 7 columns (5 fixed + 2 custom)
4. **View Dashboard**: Navigate to "Dashboard" tab
   - **Throughput by User**: Table showing each user
     - Column 1: User name
     - Column 2: Points completed (sum of Feito column tasks)
     - If no tasks in Feito, shows "0"
   - **WIP Load**: Table showing each user
     - Column 1: User name
     - Column 2: Sum of Fibonacci points in in-progress columns (Ready, Custom, Teste)
     - Identifies overloaded users (> 13 points typically)
   - **Deadline Alerts**: List of tasks
     - Filter: deadline < 48h AND checklist progress < 80%
     - Shows task title, executor, days remaining, checklist %
     - Red highlight for critical (< 24h)
5. **Edit Task Deadline to Trigger Alert**:
   - Find a task with incomplete checklist
   - Edit deadline to "1 day from now" (< 48h)
   - Go back to Dashboard
   - Task appears in "Deadline Alerts" section
6. **Mark Checklist Items**: Go back to task detail
   - Mark 50% of checklist items as done
   - Go to Dashboard → Deadline Alerts
   - Task still shows (< 80% completion)
   - Mark 80%+ items
   - Task disappears from Deadline Alerts
### Pass Criteria
- ✅ Custom columns can be created, deleted, reordered
- ✅ Tasks drag freely between standard and custom columns
- ✅ Dashboard Throughput calculated correctly (sum of points in Feito)
- ✅ Dashboard WIP Load calculated correctly (sum of in-progress points)
- ✅ Dashboard Deadline Alerts filtered (< 48h AND < 80% checklist)
- ✅ All metrics update dynamically as tasks move
- ✅ LocalStorage persists custom columns and task positions
---
## Data Validation Checklist
### Fibonacci Validation
- [ ] Accept: 1, 2, 3, 5, 8, 13
- [ ] Reject: 0, 4, 6, 7, 9, 10, 11, 12, 14+
- [ ] Error message: "Points must be in Fibonacci sequence"
### Workday Conversion
- [ ] 8h → "1 day"
- [ ] 16h → "2 days"
- [ ] 24h → "3 days"
- [ ] 4h → "4h"
- [ ] 1h → "1h"
### Countdown Timer
- [ ] > 1 day: "X days remaining"
- [ ] 0 days: "Today"
- [ ] -1 day: "OVERDUE"
### Reviewer Validation
- [ ] Executor ≠ Reviewer enforced
- [ ] Can't move to Teste without reviewer assigned
- [ ] Error: "Reviewer required for Teste"
### Metrics Calculations
- [ ] Throughput = sum(points where columnId == 'Feito' AND executorId == user)
- [ ] WIP = sum(points where columnId in [Ready, Custom, Teste] AND executorId == user)
- [ ] Alerts = tasks where (deadline - now < 48h) AND (checklist.done / checklist.length < 0.8)
---
## LocalStorage Inspection
**To verify data integrity**:
```javascript
// In browser console
const state = JSON.parse(localStorage.getItem('board_state_v1'));
console.log('Users:', state.users.length);         // Should be 10
console.log('Tasks:', state.tasks.length);         // Should be 15-20
console.log('Columns:', state.columns.length);     // Should be 5+ (5 fixed + custom)
console.log('Last Updated:', state.lastUpdated);   // ISO date string
console.log('First Task:', state.tasks[0]);        // Full task object
```
---
## Performance Checklist
- [ ] App load time < 1 second
- [ ] Drag-drop interaction < 100ms
- [ ] Dashboard render < 500ms
- [ ] State mutations < 50ms
- [ ] Page reload < 500ms (from persisted LocalStorage)
---
## Browser Compatibility
**Tested & Supported**:
- ✅ Chrome/Chromium 120+
- ✅ Firefox 121+
- ✅ Safari 17+
- ✅ Edge 120+
**LocalStorage Support**: All modern browsers support 5-10MB LocalStorage
---
## Troubleshooting
| Issue | Cause | Solution |
|-------|-------|----------|
| Tasks visible but not draggable | CDK drag-drop not initialized | Check console for errors, reload page |
| LocalStorage not persisting | Browser storage disabled | Check privacy settings, clear cache |
| Reviewer selector shows executor | Validation not working | Check Signal state, verify !== operator |
| Metrics showing 0 | Tasks not in Feito column | Move tasks to "Feito" to capture points |
| Custom column not appearing | Sequence number conflict | Check column sequence ordering (0-100) |
---
## Success Criteria Summary
**MVP is complete when**:
1. ✅ All 3 scenarios pass without errors
2. ✅ Drag-drop smooth and responsive
3. ✅ Fibonacci validation working
4. ✅ Reviewer workflow enforced
5. ✅ Metrics calculated correctly
6. ✅ LocalStorage persists data across reloads
7. ✅ Unit tests for services/pipes passing
