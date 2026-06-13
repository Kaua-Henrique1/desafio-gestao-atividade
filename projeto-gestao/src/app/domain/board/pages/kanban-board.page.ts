import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardStateService } from '../services/board-state.service';
import { Task, User, ChecklistItem } from '@core/models/interfaces';

@Component({
  selector: 'app-kanban-board-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <header class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-semibold">Kanban Board</h1>
        <button class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Create New Column</button>
      </header>

      <section class="kanban-board">
        <!-- responsive grid: 1 column on small screens, horizontal scroll on large -->
        <div class="flex gap-4 overflow-x-auto pb-4">
          <!-- Column -->
          <section
            class="min-w-[280px] max-w-sm bg-slate-50 rounded-lg p-3 shadow-sm"
            *ngFor="let col of columns()"
          >
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-lg font-medium">{{ col.name }}</h2>
              <span class="text-xs text-gray-500">#{{ col.sequence }}</span>
            </div>

            <div class="space-y-3">
              <!-- Tasks for column -->
              <article
                class="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition"
                *ngFor="let task of getTasksForColumn(col.id)"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <h3 class="text-sm font-semibold">{{ task.title }}</h3>
                    <p class="text-xs text-gray-500 mt-1">{{ task.description }}</p>
                  </div>

                  <div class="flex flex-col items-end gap-2">
                    <div class="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                      {{ task.points }} pts
                    </div>
                    <div class="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm" title="{{ getUserById(task.executorId)?.name }}">
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
                    <div class="h-2 rounded-full bg-green-500" style="width: {{ checklistPercent(task) }}%"></div>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    </div>
  `,
  styles: [],
})
export class KanbanBoardPage {
  private board = inject(BoardStateService);

  // Expose signals directly if needed in template
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
    if (!deadline) return 'No deadline';
    const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const today = new Date();
    // normalize time portion
    const diffMs = d.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (days >= 0) return `${days} day${days === 1 ? '' : 's'} remaining`;
    const abs = Math.abs(days);
    return `Delayed by ${abs} day${abs === 1 ? '' : 's'}`;
  }

  checklistProgressText(task: Task): string {
    const total = task.checklist?.length ?? 0;
    const done = task.checklist?.filter((c: ChecklistItem) => c.done).length ?? 0;
    return `${done}/${total} items`;
  }

  checklistPercent(task: Task): number {
    const total = task.checklist?.length ?? 0;
    if (total === 0) return 0;
    const done = task.checklist?.filter((c: ChecklistItem) => c.done).length ?? 0;
    return Math.round((done / total) * 100);
  }
}




