export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'Gestor' | 'Executor' | 'Revisor';
  avatarColor?: string;
}

export interface ChecklistItem {
  id: string;
  title: string; // 👈 Garanta que aqui seja 'title'
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  executorId: string;
  reviewerId?: string | null;
  points: number;
  checklist?: ChecklistItem[]; // 👈 Usando a interface unificada com 'title'
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  cancelReason?: string;
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
