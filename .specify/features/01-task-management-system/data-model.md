# Data Model: 48-Hour MVP (Client-Side Only)
**Scope**: Pure TypeScript interfaces, no SQL, no database schema.
All data lives in memory (Signal state) during session and persists to LocalStorage as JSON.
---
## Core Interfaces
### User
```typescript
export interface User {
  id: string;                    // UUID or incremental ID
  name: string;                  // e.g., "João Silva"
  email: string;                 // e.g., "joao@empresa.com"
  role: 'Gestor' | 'Executor' | 'Revisor';  // User role
  avatar?: string;               // Optional color/initials for avatar display
  createdAt: Date;               // When user was created
}
```
### Task
```typescript
export interface Task {
  id: string;                    // UUID
  title: string;                 // e.g., "Implementar autenticação"
  description?: string;          // Detailed task description
  columnId: string;              // Current column (e.g., 'Backlog', 'Ready', 'feature/auth', 'Teste', 'Feito', 'Cancelado')
  executorId: string;            // Assigned user executing the task
  reviewerId?: string;           // Optional reviewer (required when in Teste column)
  estimatedPoints: number;       // Fibonacci: 1|2|3|5|8|13
  hoursEstimate: number;         // Total hours estimated
  deadline: Date;                // Task deadline
  checklist: ChecklistItem[];    // Task acceptance criteria
  cancelReason?: string;         // If in Cancelado, why?
  createdAt: Date;
  updatedAt: Date;
}
```
### Column
```typescript
export interface Column {
  id: string;                    // Unique column ID
  name: string;                  // e.g., "Backlog", "feature/auth", "Teste"
  type: 'Fixed' | 'Custom';      // Fixed = Backlog|Ready|Teste|Feito|Cancelado, Custom = user-created
  sequence: number;              // Display order (0=first)
  isArchived: boolean;           // Soft-archived columns
  createdAt: Date;
}
```
### ChecklistItem
```typescript
export interface ChecklistItem {
  id: string;                    // UUID
  taskId: string;                // Parent task
  text: string;                  // e.g., "User can log in with email"
  done: boolean;                 // Checkbox status
  completedBy?: string;          // User ID who checked it
  completedAt?: Date;            // When checked
}
```
### UserMetric
```typescript
export interface UserMetric {
  id: string;                    // UUID
  userId: string;                // User this metric belongs to
  // Executor metrics
  pointsExecuted: number;        // Sum of story points for tasks moved to Feito by this user
  tasksCompleted: number;        // Count of tasks moved to Feito
  // Reviewer metrics
  pointsReviewed: number;        // Sum of fixed bonus (2pts per review) for tasks reviewed
  tasksReviewed: number;         // Count of tasks reviewed
  calculatedAt: Date;            // When this was calculated
}
```
### BoardState (Central State)
```typescript
export interface BoardState {
  users: User[];                 // All 10 seeded users
  columns: Column[];             // 5 fixed + N custom columns
  tasks: Task[];                 // All tasks in board
  metrics: UserMetric[];         // Pre-calculated metrics per user
  lastUpdated: Date;             // When state was last modified
}
```
---
## TypeScript Constants
### Fixed Columns
```typescript
export const FIXED_COLUMNS = [
  { id: 'backlog', name: 'Backlog', type: 'Fixed' as const, sequence: 0 },
  { id: 'ready', name: 'Ready', type: 'Fixed' as const, sequence: 1 },
  // [Custom columns inserted here, sequence 2+]
  { id: 'teste', name: 'Teste', type: 'Fixed' as const, sequence: 98 },
  { id: 'feito', name: 'Feito', type: 'Fixed' as const, sequence: 99 },
  { id: 'cancelado', name: 'Cancelado', type: 'Fixed' as const, sequence: 100 }
];
```
### Fibonacci Sequence
```typescript
export const FIBONACCI_SEQUENCE = [1, 2, 3, 5, 8, 13] as const;
export type FibonacciPoints = typeof FIBONACCI_SEQUENCE[number];
```
---
## Validation Rules
### Task Points
```typescript
function isValidPoints(points: number): boolean {
  return FIBONACCI_SEQUENCE.includes(points);
}
```
### Task Executor ≠ Reviewer
```typescript
function isValidReviewer(task: Task, reviewerId: string): boolean {
  return task.executorId !== reviewerId;
}
```
### Task Deadline
```typescript
function isValidDeadline(deadline: Date): boolean {
  return deadline > new Date();  // Must be in future
}
```
### Checklist Progress
```typescript
function getChecklistProgress(task: Task): number {
  if (task.checklist.length === 0) return 100;
  const done = task.checklist.filter(c => c.done).length;
  return (done / task.checklist.length) * 100;
}
```
---
## State Transitions
### Valid Column Transitions
```
Backlog → Ready (always allowed)
       → [Custom Column] (only if Ready first, or from Ready/Custom)
       → Teste (requires reviewer assigned)
       → Feito (captures points, records metrics)
       → Cancelado (anytime, zeroes points)
Ready → Backlog (anytime)
     → [Custom Column]
     → Teste
     → Cancelado
[Custom] → [Any other Custom] (freely)
        → Teste
        → Cancelado
Teste → Feito (requires reviewer assigned + approval)
     → Backlog (regression)
     → Cancelado
Feito → (frozen, no transitions)
Cancelado → (frozen, no transitions)
```
---
## LocalStorage Schema
```
Key: "board_state_v1"
Value: JSON.stringify({
  users: User[],
  columns: Column[],
  tasks: Task[],
  metrics: UserMetric[],
  lastUpdated: string (ISO Date)
})
Size: ~50-200KB for MVP scope (100 tasks)
Update Frequency: On every state mutation (move, create, edit, delete)
Load Time: <100ms on app startup
```
---
## Seeded Data (seed-data.service.ts)
### 10 Hardcoded Users
```typescript
export const SEED_USERS: User[] = [
  { id: 'u1', name: 'Ricardo Silva', email: 'ricardo@empresa.com', role: 'Gestor' },
  { id: 'u2', name: 'João Santos', email: 'joao@empresa.com', role: 'Executor' },
  { id: 'u3', name: 'Maria Oliveira', email: 'maria@empresa.com', role: 'Executor' },
  { id: 'u4', name: 'Pedro Costa', email: 'pedro@empresa.com', role: 'Executor' },
  { id: 'u5', name: 'Ana Ferreira', email: 'ana@empresa.com', role: 'Executor' },
  { id: 'u6', name: 'Carlos Mendes', email: 'carlos@empresa.com', role: 'Executor' },
  { id: 'u7', name: 'Lucia Alves', email: 'lucia@empresa.com', role: 'Revisor' },
  { id: 'u8', name: 'Bruno Rocha', email: 'bruno@empresa.com', role: 'Revisor' },
  { id: 'u9', name: 'Fernanda Lima', email: 'fernanda@empresa.com', role: 'Executor' },
  { id: 'u10', name: 'Diego Martins', email: 'diego@empresa.com', role: 'Executor' }
];
```
### 15-20 Seeded Tasks (sample)
```typescript
export const SEED_TASKS: Task[] = [
  {
    id: 'task1',
    title: 'Implementar autenticação com JWT',
    description: 'Setup login/logout flow',
    columnId: 'backlog',
    executorId: 'u2',
    estimatedPoints: 5,
    hoursEstimate: 40,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    checklist: [
      { id: 'check1', taskId: 'task1', text: 'JWT token generation', done: false },
      { id: 'check2', taskId: 'task1', text: 'Token validation middleware', done: false },
      { id: 'check3', taskId: 'task1', text: 'Logout endpoint', done: false }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // ... 14-19 more tasks across different columns and statuses
];
```
---
## Relationships
**User ↔ Task**: User.id appears in Task.executorId and Task.reviewerId
**Column ↔ Task**: Column.id appears in Task.columnId
**Task ↔ ChecklistItem**: Task.id appears in ChecklistItem.taskId
**User ↔ UserMetric**: User.id appears in UserMetric.userId
**No database relationships needed. All resolved by ID-matching in services.**
---
## Notes for Implementation
1. **No ORM**: Plain TypeScript interfaces, object literals
2. **No Migrations**: Data shape can evolve, old LS data is lossy-hydrated
3. **No Transactions**: Single-user app, no concurrency
4. **JSON Serialization**: `JSON.stringify()` for LS, `JSON.parse()` to load
5. **Date Handling**: Store as ISO strings in LS, convert back to Date in memory
6. **ID Generation**: Use `crypto.randomUUID()` or simple incrementing counter
