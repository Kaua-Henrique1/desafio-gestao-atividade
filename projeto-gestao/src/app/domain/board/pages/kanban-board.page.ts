import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CdkDragDrop, DragDropModule} from '@angular/cdk/drag-drop';
import {BoardStateService} from '../services/board-state.service';
import {Task, User} from '@core/models/interfaces';
import {FormsModule} from '@angular/forms';
import {WorkdayConversionPipe} from '@core/pipes/workday-conversion.pipe';
import {CountdownPipe} from '@core/pipes/countdown.pipe';
import {FibonacciValidatorDirective} from '@core/directives/fibonacci-validator.directive';

@Component({
  selector: 'app-kanban-board-page',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, WorkdayConversionPipe, CountdownPipe, FibonacciValidatorDirective],
  template: `
    <div class="p-4">
      <div class="flex gap-4 p-4 bg-slate-800 text-white mb-4 rounded shadow">
        <button (click)="currentTab.set('board')" [class.bg-blue-600]="currentTab() === 'board'" class="px-4 py-2 rounded font-medium transition">Quadro Kanban</button>
        <button (click)="currentTab.set('dashboard')" [class.bg-blue-600]="currentTab() === 'dashboard'" class="px-4 py-2 rounded font-medium transition">Dashboard KPIs</button>
      </div>

      <header class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-semibold text-slate-800">Painel de Engenharia</h1>
        <div class="flex gap-2">
          <button (click)="addNewTask()" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition">
            ＋ Adiciona Task
          </button>
          <button (click)="createNewColumn()" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Criar uma nova Coluna
          </button>
        </div>
      </header>

      @if (currentTab() === 'board') {
        <section class="kanban-board">
          <div class="flex gap-4 overflow-x-auto pb-4" cdkDropListGroup>
            @for (col of columns(); track col.id) {
              <section class="min-w-[280px] max-w-sm bg-slate-800 rounded-lg p-3 shadow-md border border-slate-700">
                <div class="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
                  <h2 class="text-lg font-bold text-slate-200 truncate pr-2" [title]="col.name">{{ col.name }}</h2>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">#{{ col.sequence }}</span>

                    @if (!col.isFixed) {
                      <button
                        (click)="removeCustomColumn(col.id, $event)"
                        class="text-red-400 hover:text-red-100 bg-red-950/40 hover:bg-red-600 px-2 py-0.5 rounded text-xs font-black transition-all cursor-pointer border border-red-800/60 shadow-sm"
                        title="Remover Coluna Customizada">
                        ✕
                      </button>
                    }
                  </div>
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
                      class="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer border border-slate-100 select-none"
                    >
                      <div *cdkDragPlaceholder class="border-2 border-dashed border-gray-300 rounded-xl h-24 bg-gray-50/50"></div>

                      <div class="flex items-start justify-between gap-2">
                        <div class="flex-1">
                          <h3 class="text-sm font-semibold text-gray-800">{{ task.title }}</h3>
                          <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ task.description }}</p>
                        </div>

                        <div class="flex flex-col items-end gap-2">
                          <div class="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                            {{ task.points | workdayConversion }}
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
                        <span
                          [class.text-red-600]="task.columnId !== 'col-feito' && isOverdue(task.dueDate)"
                          [class.text-emerald-600]="task.columnId === 'col-feito'">
                          {{ task.dueDate | countdown: task.columnId }}
                        </span>

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
      }

      @if (currentTab() === 'dashboard') {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-900 text-white min-h-[500px] rounded-xl shadow-inner">
          <div class="p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
            <h3 class="font-bold mb-3 text-blue-400 uppercase tracking-wider text-xs border-b border-slate-700 pb-2">Throughput por Usuário</h3>
            @for (m of throughput(); track m.userId) {
              <p class="text-sm border-b border-slate-700/50 py-2 flex justify-between">
                <span class="font-medium">{{ getUserById(m.userId)?.name || 'User ' + m.userId }}</span>
                <span class="text-blue-300 font-mono font-bold">{{ m.pointsExecuted }} pts concluídos</span>
              </p>
            } @empty {
              <p class="text-xs text-slate-500 italic py-2">Nenhuma métrica registrada ainda.</p>
            }
          </div>

          <div class="p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
            <h3 class="font-bold mb-3 text-yellow-400 uppercase tracking-wider text-xs border-b border-slate-700 pb-2">Carga de Trabalho (WIP)</h3>
            @for (w of wipLoad(); track w.userId) {
              <p class="text-sm border-b border-slate-700/50 py-2 flex justify-between items-center">
                <span class="font-medium">{{ w.userName }}</span>
                <span class="text-yellow-300 font-mono bg-yellow-950/40 px-2 py-0.5 rounded text-xs border border-yellow-800">
                  {{ w.wipPoints }} pts ativos ({{ w.taskCount }} tasks)
                </span>
              </p>
            }
          </div>

          <div class="p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
            <h3 class="font-bold mb-3 text-red-400 uppercase tracking-wider text-xs border-b border-slate-700 pb-2">⚠️ Alertas de Prazo (&lt;48h)</h3>
            @for (a of alerts(); track a.id) {
              <div class="text-sm border-b border-slate-700/50 py-2 text-red-300 flex flex-col gap-0.5">
                <span class="font-semibold text-slate-200">⚠️ {{ a.title }}</span>
                <span class="text-[11px] text-red-400 font-mono">Entrega: {{ a.dueDate }} | Checklist em {{ checklistPercent(a) }}%</span>
              </div>
            } @empty {
              <p class="text-xs text-emerald-400 italic py-2 flex items-center gap-1">✓ Nenhuma tarefa em risco crítico!</p>
            }
          </div>
        </div>
      }

      @if (selectedTask) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div class="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 flex flex-col max-h-[90vh] overflow-hidden">
            <header class="flex justify-between items-center border-b pb-3 mb-4">
              <h2 class="text-xl font-bold text-gray-800">Detalhes da Tarefa</h2>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-lg font-bold">✕</button>
            </header>

            <div class="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Título</label>
                <input type="text" [(ngModel)]="selectedTask.title" class="w-full border rounded px-3 py-2 text-sm text-slate-800" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Descrição</label>
                <textarea rows="2" [(ngModel)]="selectedTask.description" class="w-full border rounded px-3 py-2 text-sm text-slate-800"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Executor</label>
                  <select [(ngModel)]="selectedTask.executorId" class="w-full border rounded px-3 py-2 text-sm bg-white text-slate-800">
                    <option value="">Sem Executor (Disponível)</option>
                    @for (user of users(); track user.id) {
                      <option [value]="user.id">{{ user.name }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Fibonacci Pts</label>
                  <input type="number" name="points" [(ngModel)]="selectedTask.points" appFibonacciValidator #pointsCtrl="ngModel" class="w-full border rounded px-3 py-2 text-sm text-slate-800" />

                  @if (pointsCtrl.invalid && (pointsCtrl.touched || pointsCtrl.dirty)) {
                    <div class="text-red-500 text-[11px] mt-1">
                      Valor inválido: utilize 1, 2, 3, 5, 8 ou 13
                    </div>
                  }
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Data de Entrega (Prazo)</label>
                  <input type="date" [(ngModel)]="selectedTask.dueDate" class="w-full border rounded px-3 py-2 text-sm text-slate-800" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 uppercase mb-1">Revisor / Homologador</label>

                @if (selectedTask.columnId === 'col-teste') {
                  <select [(ngModel)]="selectedTask.reviewerId" class="w-full border rounded px-3 py-2 text-sm bg-green-50 border-green-300 text-slate-800">
                    <option [value]="null">Aguardando Revisão...</option>
                    @for (user of getAvailableReviewers(); track user.id) {
                      <option [value]="user.id">{{ user.name }}</option>
                    }
                  </select>
                  <p class="text-[11px] text-gray-500 mt-1">⚠️ O revisor deve ser um usuário diferente do executor.</p>

                } @else if (selectedTask.columnId === 'col-feito') {
                  <div class="p-2 bg-emerald-50 text-emerald-800 text-sm font-medium rounded border border-emerald-200 flex items-center justify-between">
                    <span>✓ Homologado por: <strong>{{ getUserById(selectedTask.reviewerId)?.name || 'Sem revisor cadastrado' }}</strong></span>
                    <span class="text-xs bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Concluído</span>
                  </div>

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
                  <input #newCheck type="text" placeholder="Nova sub-tarefa..." (keyup.enter)="addChecklistItem(newCheck)" class="flex-1 border rounded px-3 py-1 text-sm text-slate-800" />
                  <button (click)="addChecklistItem(newCheck)" class="bg-slate-800 text-white text-xs px-3 rounded hover:bg-slate-700">Add</button>
                </div>
              </div>
            </div>

            <footer class="border-t pt-3 mt-4 flex justify-between items-center">
              <button
                (click)="deleteCurrentTask()"
                class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 rounded text-sm font-medium transition flex items-center gap-1">
                🗑️ Excluir Tarefa
              </button>

              <div class="flex gap-2">
                <button (click)="closeModal()" class="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button (click)="saveTaskChanges()" class="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Salvar e Fechar</button>
              </div>
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

  private isDragging = false;
  selectedTask: Task | null = null;
  currentTab = signal<'board' | 'dashboard'>('board');

  readonly wipLoad = this.board.wipLoadByUser;
  readonly alerts = this.board.deadlineAlerts;
  readonly throughput = this.board.throughputByUser;

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

  // 🚀 CORREÇÃO DE BUG DE FUSO NO MÉTODO DE ESTADO DA UI:
  isOverdue(deadline?: string | null): boolean {
    if (!deadline) return false;

    const dateParts = deadline.split('-');
    if (dateParts.length !== 3) return false;

    // Força a data a instanciar na meia-noite local
    const d = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
    if (isNaN(d.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  }

  deleteCurrentTask(): void {
    if (!this.selectedTask) return;

    const confirmacao = confirm(`Tem certeza que deseja excluir permanentemente a tarefa "${this.selectedTask.title}"?`);
    if (!confirmacao) return;

    try {
      // Chama o método de exclusão do serviço
      this.board.deleteTask(this.selectedTask.id);
      // Fecha o modal após excluir
      this.closeModal();
    } catch (err: any) {
      alert(err?.message ?? 'Erro ao excluir a tarefa');
    }
  }

  checklistProgressText(task: Task): string {
    const total = task.checklist?.length ?? 0;
    const done = task.checklist?.filter((c) => c.done).length ?? 0;
    return `${done}/${total} itens`;
  }

  checklistPercent(task: Task): number {
    const total = task.checklist?.length ?? 0;
    if (total === 0) return 0;
    const done = task.checklist?.filter((c) => c.done).length ?? 0;
    return Math.round((done / total) * 100);
  }

  connectedLists(columnId: string): string[] {
    return this.columns().map((c) => c.id).filter((id) => id !== columnId);
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    this.isDragging = true;
    if (event.previousContainer === event.container) {
      setTimeout(() => { this.isDragging = false; }, 100);
      return;
    }

    const taskDragged = event.item.data as Task;
    const taskId = taskDragged?.id;
    const targetColumnId = event.container.id;

    try {
      if (!taskId) throw new Error('ID da tarefa não encontrado');
      this.board.moveTask(taskId, targetColumnId);
    } catch (err: any) {
      alert(err?.message ?? 'Não foi possível mover a tarefa');
    } finally {
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

  removeCustomColumn(columnId: string, event: Event): void {
    event.stopPropagation();
    try {
      this.board.deleteColumn(columnId);
    } catch (err: any) {
      alert(err?.message ?? 'Não foi possível remover a coluna');
    }
  }

  openTaskDetail(task: Task): void {
    this.selectedTask = JSON.parse(JSON.stringify(task));
  }

  closeModal(): void {
    this.selectedTask = null;
  }

  getAvailableReviewers(): User[] {
    const execId = this.selectedTask?.executorId;
    return this.users().filter((u: User) => u.id !== execId);
  }

  toggleChecklistItem(item: any): void {
    if (!item) return;
    item.done = !item.done;
  }

  removeChecklistItem(index: number): void {
    if (!this.selectedTask || !this.selectedTask.checklist) return;
    this.selectedTask.checklist.splice(index, 1);
  }

  addChecklistItem(titleInput: HTMLInputElement): void {
    if (!titleInput.value.trim() || !this.selectedTask) return;
    if (!this.selectedTask.checklist) this.selectedTask.checklist = [];
    this.selectedTask.checklist.push({ id: 'ch-' + Date.now(), title: titleInput.value.trim(), done: false });
    titleInput.value = '';
  }

  saveTaskChanges(): void {
    if (!this.selectedTask) return;

    try {
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
      executorId: '',
      reviewerId: null,
      points: 1,
      dueDate: new Date().toISOString().split('T')[0],
      checklist: []
    };

    try {
      this.board.addTask(payload);
    } catch (err: any) {
      alert(err?.message ?? 'Erro ao adicionar tarefa');
    }
  }
}
