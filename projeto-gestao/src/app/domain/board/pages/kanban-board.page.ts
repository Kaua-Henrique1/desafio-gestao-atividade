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
        <div class="flex gap-2">
          <button (click)="addNewTask()" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition">
            ＋ Add Task
          </button>
          <button (click)="createNewColumn()" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Create New Column
          </button>
        </div>
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
                    (dblclick)="openTaskDetail(task); $event.stopPropagation()"
                    class="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    <div *cdkDragPlaceholder class="border-2 border-dashed border-gray-300 rounded-xl h-24 bg-gray-50/50"></div>

                    <div class="flex items-start justify-between gap-2">
                      <div class="flex-1">
                        <h3 class="text-sm font-semibold text-gray-800">{{ task.title }}</h3>
                        <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ task.description }}</p>
                      </div>

                      <div class="flex flex-col items-end gap-2">
                        <div class="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                          {{ task.points }} pts
                        </div>
                        <div
                          class="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold"
                          [className]="task.executorId ? 'bg-indigo-500' : 'bg-gray-400'"
                          [title]="getUserById(task.executorId)?.name || 'Sem executor'"
                        >
                          {{ task.executorId ? initials(getUserById(task.executorId)?.name) : 'Ø' }}
                        </div>
                      </div>
                    </div>

                    <div class="mt-3 flex justify-between items-center text-xs text-gray-500">
                      <span>📅 {{ daysRemainingText(task.deadline) }}</span>
                      @if (task.reviewerId) {
                        <span class="px-1.5 py-0.5 bg-green-100 text-green-800 rounded font-medium text-[10px]" [title]="'Revisado por: ' + getUserById(task.reviewerId)?.name">
                          ✓ Rev: {{ initials(getUserById(task.reviewerId)?.name) }}
                        </span>
                      }
                    </div>

                    <div class="mt-2">
                      <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <div>📋 {{ checklistProgressText(task) }}</div>
                        <div>{{ checklistPercent(task) }}%</div>
                      </div>
                      <div class="w-full bg-gray-200 h-1.5 rounded-full">
                        <div class="h-1.5 rounded-full bg-green-500 transition-all" [style.width.%]="checklistPercent(task)"></div>
                      </div>
                    </div>
                  </article>
                }
              </div>
            </section>
          }
        </div>
      </section>

      @if (selectedTask) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div class="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 flex flex-col max-h-[90vh] overflow-hidden">

            <header class="flex justify-between items-center border-b pb-3 mb-4">
              <h2 class="text-xl font-bold text-gray-800">Detalhes da Tarefa</h2>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </header>

            <div class="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Título</label>
                <input type="text" [value]="selectedTask.title" (input)="selectedTask.title = $any($event.target).value" class="w-full border rounded px-3 py-2 text-sm" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Descrição</label>
                <textarea rows="2" [value]="selectedTask.description || ''" (input)="selectedTask.description = $any($event.target).value" class="w-full border rounded px-3 py-2 text-sm"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Executor</label>
                  <select [value]="selectedTask.executorId" (change)="selectedTask.executorId = $any($event.target).value" class="w-full border rounded px-3 py-2 text-sm bg-white">
                    <option value="">Sem Executor (Disponível)</option>
                    @for (user of users(); track user.id) {
                      <option [value]="user.id">{{ user.name }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Fibonacci Pts</label>
                  <input type="number" [value]="selectedTask.points" (input)="selectedTask.points = +$any($event.target).value" class="w-full border rounded px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Revisor / Homologador</label>
                  @if (selectedTask.columnId === 'col-teste') {
                  <select [value]="selectedTask.reviewerId || ''" (change)="selectedTask.reviewerId = $any($event.target).value || null" class="w-full border rounded px-3 py-2 text-sm bg-green-50 border-green-300">
                    <option value="">Aguardando Revisão...</option>
                    @for (user of getAvailableReviewers(); track user.id) {
                      <option [value]="user.id">{{ user.name }}</option>
                    }
                  </select>
                  <p class="text-[11px] text-gray-500 mt-1">⚠️ O revisor deve ser um usuário diferente do executor.</p>
                } @else {
                  <div class="p-2 bg-gray-100 text-gray-500 text-xs rounded border border-dashed">
                    A assinatura de homologação só será liberada na coluna "Teste".
                  </div>
                }
              </div>

              <div class="border-t pt-4">
                <h3 class="text-sm font-semibold text-gray-700 mb-2">Checklist</h3>
                <div class="space-y-2 max-h-32 overflow-y-auto mb-2">
                  @for (item of selectedTask.checklist; track item.id; let i = $index) {
                    <div class="flex items-center justify-between bg-slate-50 p-2 rounded border text-sm">
                      <label class="flex items-center gap-2 cursor-pointer flex-1">
                        <input type="checkbox" [checked]="item.done" (change)="toggleChecklistItem(item)" class="rounded" />
                        <span [class.line-through]="item.done" [class.text-gray-400]="item.done">{{ item.title }}</span>
                      </label>
                      <button (click)="removeChecklistItem(i)" class="text-red-500 hover:text-red-700 text-xs px-2">Remover</button>
                    </div>
                  } @empty {
                    <p class="text-xs text-gray-400 italic">Nenhum item.</p>
                  }
                </div>
                <div class="flex gap-2">
                  <input #newCheck type="text" placeholder="Nova sub-tarefa..." (keyup.enter)="addChecklistItem(newCheck)" class="flex-1 border rounded px-3 py-1 text-sm" />
                  <button (click)="addChecklistItem(newCheck)" class="bg-slate-800 text-white text-xs px-3 rounded">Add</button>
                </div>
              </div>
            </div>

            <footer class="border-t pt-3 mt-4 flex justify-end gap-2">
              <button (click)="closeModal()" class="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button (click)="saveTaskChanges()" class="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Salvar e Fechar</button>
            </footer>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .cdk-drop-list-interpolating .cdk-drag { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .cdk-drag-preview { box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important; opacity: 0.9; transform: scale(1.02); cursor: grabbing !important; border: 2px solid #3b82f6; }
  `],
})
export class KanbanBoardPage {
  private board = inject(BoardStateService);

  readonly columns = this.board.columns;
  readonly tasks = this.board.tasks;
  readonly users = this.board.users;

  // Drag guard to prevent click-after-drag opening the modal
  private isDragging = false;

  selectedTask: Task | null = null;

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
    return `Atrasado por ${Math.abs(days)} dia${Math.abs(days) === 1 ? '' : 's'}`;
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
    // set dragging flag to avoid click event after drop
    this.isDragging = true;
    if (event.previousContainer === event.container) {
      // reset dragging flag after a short delay
      setTimeout(() => { this.isDragging = false; }, 100);
      return;
    }

    const taskId = event.item.data?.id;
    const targetColumnId = event.container.id;

    try {
      if (!taskId) throw new Error('ID da tarefa não encontrado');
      this.board.moveTask(taskId, targetColumnId);
    } catch (err: any) {
      alert(err?.message ?? 'Não foi possível mover a tarefa');
    } finally {
      // small delay to avoid click-after-drag from opening the modal
      setTimeout(() => { this.isDragging = false; }, 100);
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

  openTaskDetail(task: Task): void {
    this.selectedTask = JSON.parse(JSON.stringify(task)); // Deep clone seguro para isolar edições da UI
  }

  closeModal(): void {
    this.selectedTask = null;
  }

  getAvailableReviewers(): User[] {
    const execId = this.selectedTask?.executorId;
    return this.users().filter((u: User) => u.id !== execId);
  }

  toggleChecklistItem(item: ChecklistItem): void {
    if (!item) return;
    item.done = !item.done;
  }

  removeChecklistItem(index: number): void {
    if (!this.selectedTask) return;
    this.selectedTask.checklist.splice(index, 1);
  }

  addChecklistItem(titleInput: HTMLInputElement): void {
    if (!titleInput.value.trim() || !this.selectedTask) return;
    this.selectedTask.checklist.push({ id: 'ch-' + Date.now(), title: titleInput.value.trim(), done: false });
    titleInput.value = '';
  }

  saveTaskChanges(): void {
    if (!this.selectedTask) return;
    // If task is in Teste, reviewer must be assigned
    if (this.selectedTask.columnId === 'col-teste' && !this.selectedTask.reviewerId) {
      alert('A tarefa na coluna "Teste" requer que um revisor seja atribuído antes de salvar.');
      return;
    }

    try {
      // Passando os argumentos corretos para o serviço real: ID e Objeto
      this.board.updateTask(this.selectedTask.id, this.selectedTask);
      this.closeModal();
    } catch (err: any) {
      alert(err?.message ?? 'Erro ao salvar tarefa');
    }
  }

  addNewTask(): void {
    const payload = {
      title: 'Nova Tarefa',
      description: '',
      columnId: this.columns()[0]?.id || 'col-backlog',
      executorId: '', // Começa estritamente sem executor
      reviewerId: null,
      points: 1,
      deadline: new Date().toISOString().split('T')[0],
      checklist: []
    };

    try {
      this.board.addTask(payload);
    } catch (err: any) {
      alert(err?.message ?? 'Erro ao adicionar tarefa');
    }
  }
}
