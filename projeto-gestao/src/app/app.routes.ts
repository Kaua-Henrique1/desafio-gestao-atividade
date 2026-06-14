import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./domain/board/pages/kanban-board.page').then(m => m.KanbanBoardPage)
  }
];
