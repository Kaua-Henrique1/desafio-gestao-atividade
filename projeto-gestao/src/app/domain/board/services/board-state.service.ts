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

  // MUTAÇÃO COMPLETA DA SPRINT 3 + REGRAS DE NEGÓCIO
  updateTask(taskId: string, updatedFields: Partial<Task>): void {
    const currentTasks = this._state().tasks;
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) throw new Error('Tarefa não encontrada!');

    // 1. Validação Estrita de Fibonacci
    if (updatedFields.points !== undefined) {
      const validFibonacci = [1, 2, 3, 5, 8, 13];
      if (!validFibonacci.includes(updatedFields.points)) {
        throw new Error('Pontuação inválida! Use apenas Fibonacci (1, 2, 3, 5, 8, 13).');
      }
    }

    // 2. Validação: Revisor NÃO pode ser o Executor
    const finalExecutorId = updatedFields.executorId !== undefined ? updatedFields.executorId : task.executorId;
    const finalReviewerId = updatedFields.reviewerId !== undefined ? updatedFields.reviewerId : task.reviewerId;

    if (finalReviewerId && finalExecutorId === finalReviewerId) {
      throw new Error('Regra de Segurança: O Revisor não pode ser o próprio Executor da tarefa!');
    }

    const updatedTasks = currentTasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          ...updatedFields,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    this.saveToStorage({ ...this._state(), tasks: updatedTasks });
  }

  // CONTROLE DE FLUXO DE COLUNAS ESTRETO (CORRIGIDO E BLINDADO)
  moveTask(taskId: string, targetColumnId: string): void {
    const currentTasks = this._state().tasks;
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) return;

    const indoParaInicio = targetColumnId === 'col-backlog' || targetColumnId === 'col-ready';

    // Regra: Para ir para novas branches ou testes, precisa ter um executor vinculado
    if (!indoParaInicio && !task.executorId) {
      throw new Error('Não é possível mover: Vincule um Executor no modal antes de tirar a tarefa de Ready.');
    }

    // Regra: Só vai para FEITO se a origem for TESTE e tiver aprovação (reviewerId preenchido)
    if (targetColumnId === 'col-feito') {
      if (task.columnId !== 'col-teste') {
        throw new Error('Fluxo Inválido: A tarefa só pode ir para "Feito" vinda da coluna "Teste".');
      }
      if (!task.reviewerId) {
        throw new Error('Bloqueio: A tarefa precisa ser revisada e assinada por um Revisor antes de ir para Feito.');
      }
    }

    const updatedTasks = currentTasks.map(t => {
      if (t.id === taskId) {
        // Verifica se está voltando de Teste para uma branch (Ignora se estiver indo para Feito ou permanecendo em Teste)
        const voltandoParaBranch = task.columnId === 'col-teste' && !indoParaInicio && targetColumnId !== 'col-feito' && targetColumnId !== 'col-teste';

        return {
          ...t,
          columnId: targetColumnId,
          // Se for para o Backlog/Ready, limpa o executor. Se for para uma Branch, mantém o executor original intacto!
          executorId: indoParaInicio ? '' : t.executorId,
          // Se voltou para a branch, limpa o revisor (remove a tag), senão mantém o que estava
          reviewerId: voltandoParaBranch ? null : t.reviewerId,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    this.saveToStorage({ ...this._state(), tasks: updatedTasks });
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
