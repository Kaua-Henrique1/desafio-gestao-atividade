import { Injectable } from '@angular/core';
import { User, Column, Task, ChecklistItem } from '@core/models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class SeedDataService {
  constructor() {}

  getUsers(): User[] {
    return [
      { id: 'u1', name: 'Alice', email: 'alice@example.com' },
      { id: 'u2', name: 'Bruno', email: 'bruno@example.com' },
      { id: 'u3', name: 'Carla', email: 'carla@example.com' },
      { id: 'u4', name: 'Diego', email: 'diego@example.com' },
      { id: 'u5', name: 'Elena', email: 'elena@example.com' },
      { id: 'u6', name: 'Fabio', email: 'fabio@example.com' },
      { id: 'u7', name: 'Gabi', email: 'gabi@example.com' },
      { id: 'u8', name: 'Hugo', email: 'hugo@example.com' },
      { id: 'u9', name: 'Iara', email: 'iara@example.com' },
      { id: 'u10', name: 'Joao', email: 'joao@example.com' },
    ];
  }

  getFixedColumns(): Column[] {
    return [
      { id: 'col-backlog', name: 'Backlog', sequence: 0, isFixed: true },
      { id: 'col-ready', name: 'Ready', sequence: 1, isFixed: true },
      { id: 'col-teste', name: 'Teste', sequence: 3, isFixed: true },
      { id: 'col-feito', name: 'Feito', sequence: 4, isFixed: true },
      { id: 'col-cancelado', name: 'Cancelado', sequence: 5, isFixed: true },
    ];
  }

  getSeedTasks(): Task[] {
    const now = Date.now();

    // Helper ajustado para usar 'title' em conformidade com o ChecklistItem da Sprint 5
    const makeChecklist = (n: number): ChecklistItem[] => {
      const items: ChecklistItem[] = [];
      for (let i = 0; i < n; i++) {
        items.push({ id: `c${i + 1}`, title: `Item ${i + 1}`, done: i === 0 });
      }
      return items;
    };

    return [
      {
        id: 't1',
        title: 'Implement login page',
        description: 'Create auth page and form validation',
        points: 3,
        executorId: 'u1',
        reviewerId: null,
        columnId: 'col-backlog',
        checklist: makeChecklist(3),
        dueDate: new Date(now + 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 't2',
        title: 'Create landing page',
        description: 'Marketing landing with hero and CTA',
        points: 5,
        executorId: 'u2',
        reviewerId: null,
        columnId: 'col-ready',
        checklist: makeChecklist(4),
        dueDate: new Date(now + 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 't3',
        title: 'Refactor API client',
        description: 'Simplify client and add types',
        points: 8,
        executorId: 'u3',
        reviewerId: null,
        columnId: 'col-ready',
        checklist: makeChecklist(5),
        dueDate: new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 't4',
        title: 'Fix payment bug',
        description: 'Investigate race condition in checkout',
        points: 2,
        executorId: 'u4',
        reviewerId: 'u1', // Vínculo válido para evitar bloqueios de fluxo
        columnId: 'col-teste',
        checklist: makeChecklist(2),
        dueDate: new Date(now + 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0], // Forçando prazo curto para testar os alertas do Dashboard (<48h)
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 't5',
        title: 'Write unit tests',
        description: 'Add tests for utils and pipes',
        points: 3,
        executorId: 'u5',
        reviewerId: null,
        columnId: 'col-feito',
        checklist: makeChecklist(3),
        dueDate: new Date(now + 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 't6',
        title: 'Accessibility fixes',
        description: 'Fix tab order and aria labels',
        points: 1,
        executorId: 'u6',
        reviewerId: null,
        columnId: 'col-ready',
        checklist: makeChecklist(2),
        dueDate: new Date(now + 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}
