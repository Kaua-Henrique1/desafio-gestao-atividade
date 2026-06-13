import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { BoardStateService } from '../services/board-state.service';
import { Task, User, ChecklistItem } from '@core/models/interfaces';

@Component({
  selector: 'app-kanban-board-page',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="p-4">
      <header class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-semibold">Kanban Board</h1>
        <button
          (click)="createNewColumn()"
          class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Create New Column
        </button>
      </header>

      <section class="kanban-board">
        <div class="flex gap-4 overflow-x-auto pb-4" cdkDropListGroup>

          @for (col of columns(); track col.id) {
            <section class="min-w-[280px] max-w-sm bg-slate-50 rounded-lg p-3 shadow-sm">
              <div class="flex items-center justify-between mb-3">
                <h2 class="text-lg font-medium">{{ col.name }}</h2>
                <span class="text-xs text-gray-500">#{{ col.sequence }}</span>
              </div>

              <div
                class="space-y-3 min-h-[200px]"
                cdkDropList
                [cdkDropListData]="getTasksForColumn(col.id)"
                [id]="col.id"
                [cdkDropListConnectedTo]="connectedLists(col.id)"
                (cdkDropListDropped)="onDrop($event)"
              >

                @for (task of getTasksForColumn(col.id); track task.id) {
                  <article
                    cdkDrag
                    [cdkDragData]="task"
                    class="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing"
                  >
                    <div *cdkDragPlaceholder class="border-2 border-dashed border-gray-300 rounded-xl h-24 bg-gray-50/50"></div>

                    <div class="flex items-start justify-between gap-2">
                      <div class="flex-1">
                        <h3 class="text-sm font-semibold">{{ task.title }}</h3>
                        <p class="text-xs text-gray-500 mt-1">{{ task.description }}</p>
                      </div>

                      <div class="flex flex-col items-end gap-2">
                        <div class="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                          {{ task.points }} pts
                        </div>
                        <div
                          class="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm"
                          [title]="getUserById(task.executorId)?.name || 'Sem executor'"
                        >
                          {{ initials(getUserById(task.executorId)?.name) }}
                        </div>
                      </div>
                    </div>

                    <div class="mt-3 text-sm text-gray-600">
                      {{ daysRemainingText(task.deadline) }}
                    </div>

                    <div class="mt-2">
                      <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <div>{{ checklistProgressText(task) }}</div>
                        <div>{{ checklistPercent(task) }}%</div>
                      </div>
                      <div class="w-full bg-gray-200 h-2 rounded-full">
                        <div
                          class="h-2 rounded-full bg-green-500 transition-all"
                          [style.width.%]="checklistPercent(task)"
                        ></div>
                      </div>
                    </div>
                  </article>
                }

              </div>
            </section>
          }

        </div>
      </section>
    </div>
  `,
  styles: [`
    /* Animação suave quando o card volta se o drop for rejeitado */
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    /* Animação suave nos outros cards da lista abrindo espaço para o novo card */
    .cdk-drop-list-interpolating .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    /* Estilo do card de verdade que fica "preso" no seu mouse durante o arrasto */
    .cdk-drag-preview {
      box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important;
      opacity: 0.9;
      transform: scale(1.02);
      cursor: grabbing !important;
      border: 2px solid #3b82f6; /* bordinha azul charmosa enquanto arrasta */
    }
  `],
})
export class KanbanBoardPage {
  private board = inject(BoardStateService);

  readonly columns = this.board.columns;
  readonly tasks = this.board.tasks;
  readonly users = this.board.users;

  getTasksForColumn(columnId: string): Task[] {
    return this.tasks().filter((t: Task) => t.columnId === columnId);
  }

  getUserById(userId?: string | null): User | undefined {
    if (!userId) return undefined;
    return this.users().find((u: User) => u.id === userId);
  }

  initials(name?: string | null): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  daysRemainingText(deadline?: Date | string | null): string {
    if (!deadline) return 'Sem prazo';
    const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const today = new Date();
    const diffMs = d.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (days >= 0) return `${days} dia${days === 1 ? '' : 's'} restante${days === 1 ? '' : 's'}`;
    const abs = Math.abs(days);
    return `Atrasado por ${abs} dia${abs === 1 ? '' : 's'}`;
  }

  checklistProgressText(task: Task): string {
    const total = task.checklist?.length ?? 0;
    const done = task.checklist?.filter((c: ChecklistItem) => c.done).length ?? 0;
    return `${done}/${total} itens`;
  }

  checklistPercent(task: Task): number {
    const total = task.checklist?.length ?? 0;
    if (total === 0) return 0;
    const done = task.checklist?.filter((c: ChecklistItem) => c.done).length ?? 0;
    return Math.round((done / total) * 100);
  }

  connectedLists(columnId: string): string[] {
    return this.columns().map((c) => c.id).filter((id) => id !== columnId);
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) return;

    const taskId = event.item.data?.id;
    const targetColumnId = event.container.id;

    try {
      if (!taskId) throw new Error('ID da tarefa não encontrado');
      this.board.moveTask(taskId, targetColumnId);
    } catch (err: any) {
      alert(err?.message ?? 'Não foi possível mover a tarefa');
    }
  }

  createNewColumn(): void {
    const columnName = prompt('Digite o nome da nova coluna:');
    if (!columnName || !columnName.trim()) return;
    try {
      this.board.addColumn(columnName.trim());
    } catch (err: any) {
      alert(err?.message ?? 'Não foi possível criar a coluna');
    }
  }
}
