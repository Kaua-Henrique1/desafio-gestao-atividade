import {computed, inject, Injectable, signal} from '@angular/core';
import {BoardState, Column, Task, UserMetric} from '@core/models/interfaces';
import {SeedDataService} from './seed-data.service';

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

  // REATIVO: Atividades concluídas computadas em tempo real para o Dashboard
  readonly throughputByUser = computed(() => {
    const tasks = this._state().tasks;
    const users = this._state().users;

    return users.map(user => {
      const completedTasks = tasks.filter(t => t.executorId === user.id && t.columnId === 'col-feito');
      const totalPoints = completedTasks.reduce((sum, t) => sum + (t.points || 0), 0);

      return {
        userId: user.id,
        userName: user.name,
        pointsExecuted: totalPoints,
        tasksCompleted: completedTasks.length
      };
    }).sort((a, b) => b.pointsExecuted - a.pointsExecuted);
  });

  // REATIVO: Carga de Trabalho considerando colunas dinâmicas customizadas
  readonly wipLoadByUser = computed(() => {
    const tasks = this._state().tasks;
    const users = this._state().users;

    // Colunas de saída e entrada que NÃO contam como trabalho ativo em andamento (WIP)
    const colunasDeFora = ['col-backlog', 'col-ready', 'col-feito', 'col-cancelado'];

    return users.map(user => {
      const userTasksInProgress = tasks.filter(t =>
        t.executorId === user.id &&
        !colunasDeFora.includes(t.columnId)
      );

      const totalWipPoints = userTasksInProgress.reduce((sum, t) => sum + (t.points || 0), 0);

      return {
        userId: user.id,
        userName: user.name,
        wipPoints: totalWipPoints,
        taskCount: userTasksInProgress.length
      };
    });
  });

  readonly deadlineAlerts = computed(() => {
    const tasks = this._state().tasks;
    const agora = new Date().getTime();
    const quarentaEOitoHorasEmMs = 48 * 60 * 60 * 1000;

    return tasks.filter(t => {
      if (t.columnId === 'col-feito' || t.columnId === 'col-cancelado') return false;
      if (!t.dueDate) return false;

      const dateParts = t.dueDate.split('-');
      if (dateParts.length !== 3) return false;
      const prazo = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2])).getTime();

      const tempoRestante = prazo - agora;

      const totalItens = t.checklist?.length || 0;
      const itensFeitos = t.checklist?.filter(item => item.done).length || 0;
      const progressoChecklist = totalItens > 0 ? (itensFeitos / totalItens) * 100 : 0;

      const estaAtrasada = tempoRestante < 0;

      const emRiscoCritico = tempoRestante >= 0 && tempoRestante < quarentaEOitoHorasEmMs && progressoChecklist < 80;

      return estaAtrasada || emRiscoCritico;
    });
  });

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

  updateTask(taskId: string, updatedFields: Partial<Task>): void {
    const currentTasks = this._state().tasks;
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) throw new Error('Tarefa não encontrada!');

    if (updatedFields.points !== undefined) {
      const validFibonacci = [1, 2, 3, 5, 8, 13];
      if (!validFibonacci.includes(updatedFields.points)) {
        throw new Error('Pontuação inválida! Use apenas Fibonacci (1, 2, 3, 5, 8, 13).');
      }
    }

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

  deleteTask(taskId: string): void {
    const currentTasks = this._state().tasks;

    const updatedTasks = currentTasks.filter(t => t.id !== taskId);

    this.saveToStorage({ ...this._state(), tasks: updatedTasks });
  }

  moveTask(taskId: string, targetColumnId: string): void {
    const currentTasks = this._state().tasks;
    const task = currentTasks.find(t => t.id === taskId);
    if (!task) return;

    const indoParaInicio = targetColumnId === 'col-backlog' || targetColumnId === 'col-ready';

    // Regra: Se for mover para Cancelado, zeramos os pontos imediatamente
    if (targetColumnId === 'col-cancelado') {
      const updatedTasks = currentTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, columnId: targetColumnId, points: 0, updatedAt: new Date().toISOString() };
        }
        return t;
      });

      this.saveToStorage({ ...this._state(), tasks: updatedTasks });
      return;
    }

    // Regra: Para ir para novas branches ou testes, precisa ter um executor vinculado
    if (!indoParaInicio && !task.executorId && targetColumnId !== 'col-feito') {
      throw new Error('Não é possível mover: Vincule um Executor no modal antes de tirar a tarefa de Ready.');
    }

    // Regra: Validações estritas e acionamento de métricas para a coluna FEITO
    if (targetColumnId === 'col-feito') {
      if (task.columnId !== 'col-teste') {
        throw new Error('Fluxo Inválido: A tarefa só pode ir para "Feito" vinda da coluna "Teste".');
      }
      if (!task.reviewerId) {
        throw new Error('Bloqueio: A tarefa precisa possuir um Revisor definido antes de ir para Feito.');
      }

      this.calculateMetrics(task);
    }

    // Mapeamento e atualização física da coluna do card no painel Kanban
    const updatedTasks = currentTasks.map(t => {
      if (t.id === taskId) {
        const voltarParaOInicioReal = targetColumnId === 'col-backlog' || targetColumnId === 'col-ready';

        let novoExecutorId = voltarParaOInicioReal ? '' : t.executorId;
        let novoReviewerId = t.reviewerId;

        if (targetColumnId === 'col-feito') {
          novoExecutorId = t.executorId;
          novoReviewerId = t.reviewerId;
        }
        else if (task.columnId === 'col-teste' && targetColumnId !== 'col-teste') {
          novoReviewerId = null; // Limpa o revisor para nova homologação futura
        }

        return {
          ...t,
          columnId: targetColumnId,
          executorId: novoExecutorId,
          reviewerId: novoReviewerId,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    this.saveToStorage({ ...this._state(), tasks: updatedTasks });
  }

  private calculateMetrics(task: Task): void {
    const metrics = [...this._state().metrics];

    const ensureMetric = (userId: string) => {
      let m = metrics.find(mt => mt.userId === userId);
      if (!m) {
        m = {
          userId,
          pointsExecuted: 0,
          tasksCompleted: 0,
          pointsReviewed: 0,
          tasksReviewed: 0
        } as UserMetric;
        metrics.push(m);
      }
      return m;
    };

    if (task.executorId) {
      const executorMetric = ensureMetric(task.executorId);
      executorMetric.pointsExecuted = (executorMetric.pointsExecuted || 0) + (task.points || 0);
      executorMetric.tasksCompleted = (executorMetric.tasksCompleted || 0) + 1;
    }

    if (task.reviewerId) {
      const reviewerMetric = ensureMetric(task.reviewerId);
      reviewerMetric.pointsReviewed = (reviewerMetric.pointsReviewed || 0) + 2;
      reviewerMetric.tasksReviewed = (reviewerMetric.tasksReviewed || 0) + 1;
    }

    this.saveToStorage({ ...this._state(), metrics });
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

  deleteColumn(columnId: string): void {
    const cols = this._state().columns;
    const col = cols.find(c => c.id === columnId);
    if (!col) return;

    if (col.isFixed) {
      throw new Error('Colunas fixas não podem ser removidas.');
    }

    const hasTasks = this._state().tasks.some(t => t.columnId === columnId);
    if (hasTasks) {
      throw new Error('Não é possível deletar uma coluna que ainda possui tarefas! Mova as tarefas para outra coluna primeiro.');
    }

    const updatedColumns = cols.filter(c => c.id !== columnId).map(c => ({ ...c }));
    this.saveToStorage({ ...this._state(), columns: updatedColumns });
  }
}
