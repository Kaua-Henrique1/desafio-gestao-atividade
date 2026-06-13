import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./domain/board/pages/kanban-board.page').then(m => m.KanbanBoardPage)
    // ⚠️ ATENÇÃO: Se o Copilot criou a pasta dentro de 'domain' em vez de 'features', mude o caminho acima para:
    // () => import('./domain/board/pages/kanban-board.page').then(m => m.KanbanBoardPage)
  }
];
