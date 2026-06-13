import { Injectable, signal, computed, inject } from '@angular/core';
import { User, Column, Task, UserMetric, BoardState } from '@core/models/interfaces';
import { SeedDataService } from './seed-data.service';

@Injectable({
  providedIn: 'root'
})
export class BoardStateService {
  private seedDataService = inject(SeedDataService);
  private readonly STORAGE_KEY = 'board_state_v1';

  // Estado central usando Angular Signals
  private _state = signal<BoardState>({
    users: [],
    columns: [],
    tasks: [],
    metrics: [],
    lastUpdated: ''
  });

  // Sinais computados expostos para a UI
  readonly users = computed(() => this._state().users);
  readonly columns = computed(() => [...this._state().columns].sort((a, b) => a.sequence - b.sequence));
  readonly tasks = computed(() => this._state().tasks);
  readonly metrics = computed(() => this._state().metrics);

  constructor() {
    this._state.set(this.getInitialState());
  }

  private getInitialState(): BoardState {
    const localData = localStorage.getItem(this.STORAGE_KEY);

    if (localData) {
      try {
        return JSON.parse(localData) as BoardState;
      } catch (e) {
        console.error('Erro ao ler LocalStorage, carregando seed...', e);
      }
    }

    const initialState: BoardState = {
      users: this.seedDataService.getUsers(),
      columns: this.seedDataService.getFixedColumns(),
      tasks: this.seedDataService.getSeedTasks(),
      metrics: [],
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }

  private saveToStorage(state: BoardState): void {
    const updatedState = {
      ...state,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedState));
    this._state.set(updatedState);
  }

  // MUTAÇÕES DA SPRINT 2
  moveTask(taskId: string, targetColumnId: string): void {
    const currentTasks = this._state().tasks;
    const taskIndex = currentTasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) return;

    const task = currentTasks[taskIndex];

    // Regra de Negócio: Mover para Teste ('col-teste') exige um Revisor atribuído
    if (targetColumnId === 'col-teste' && !task.reviewerId) {
      throw new Error('Movimentação negada: Tarefas enviadas para Teste exigem um revisor atribuído!');
    }

    // Cria uma nova lista imutável com a tarefa atualizada
    const updatedTasks = currentTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, columnId: targetColumnId, updatedAt: new Date().toISOString() };
      }
      return t;
    });

    this.saveToStorage({
      ...this._state(),
      tasks: updatedTasks
    });
  }

  addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newTask: Task = {
      ...taskData,
      id: 't-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveToStorage({
      ...this._state(),
      tasks: [...this._state().tasks, newTask]
    });
  }

  addColumn(columnName: string): void {
    const currentColumns = this._state().columns;

    // Insert new column between Ready (sequence 1) and Teste (sequence 3).
    // We'll assign sequence = 2 and bump any columns with sequence >= 2.
    const updatedColumns = currentColumns.map((c) => ({ ...c }));
    for (const c of updatedColumns) {
      if (c.sequence >= 2) {
        c.sequence = c.sequence + 1;
      }
    }

    const newColumn: Column = {
      id: 'col-' + Date.now(),
      name: columnName,
      sequence: 2,
      isFixed: false,
    };

    updatedColumns.push(newColumn);

    this.saveToStorage({
      ...this._state(),
      columns: updatedColumns
    });
  }
}
