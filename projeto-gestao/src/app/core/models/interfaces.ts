export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'Gestor' | 'Executor' | 'Revisor';
  avatarColor?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  executorId: string;
  reviewerId: string | null;
  points: number;
  hoursEstimate?: number;
  deadline: Date | string;
  checklist: ChecklistItem[];
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  name: string;
  sequence: number;
  isFixed: boolean;
}

export interface UserMetric {
  userId: string;
  pointsExecuted: number;
  tasksCompleted: number;
  pointsReviewed: number;
  tasksReviewed: number;
}

export interface BoardState {
  users: User[];
  columns: Column[];
  tasks: Task[];
  metrics: UserMetric[];
  lastUpdated: string;
}
