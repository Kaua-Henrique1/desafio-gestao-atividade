import { TestBed } from '@angular/core/testing';
import { BoardStateService } from './board-state.service';
import { Task } from '@core/models/interfaces';

describe('BoardStateService', () => {
  let service: BoardStateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [BoardStateService]
    });
    service = TestBed.inject(BoardStateService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve ser criado com sucesso', () => {
    expect(service).toBeTruthy();
  });

  describe('Criação e Atualização de Tarefas', () => {
    it('deve adicionar uma nova tarefa e persistir no estado reativo do Signal', () => {
      const initialCount = service.tasks().length;

      service.addTask({
        title: 'Nova Task de Teste',
        columnId: 'col-backlog',
        executorId: '',
        points: 5,
        checklist: []
      });

      expect(service.tasks().length).toBe(initialCount + 1);

      const ultimaTask = service.tasks()[service.tasks().length - 1];
      expect(ultimaTask.title).toBe('Nova Task de Teste');
      expect(ultimaTask.points).toBe(5);
    });

    describe('Regras de Movimentação (moveTask)', () => {
      let taskId: string;

      beforeEach(() => {
        service.addTask({
          title: 'Task Fluxo',
          columnId: 'col-backlog',
          executorId: 'user-1',
          points: 5,
          checklist: []
        });
        taskId = service.tasks()[service.tasks().length - 1].id;
      });

      it('deve zerar pontos e NÃO pedir prompt ou justificativa ao ir para Cancelado', () => {
        service.moveTask(taskId, 'col-cancelado');
        const task = service.tasks().find(t => t.id === taskId);
        expect(task?.columnId).toBe('col-cancelado');
        expect(task?.points).toBe(0);
      });

      it('deve preservar o Executor e o Revisor quando a tarefa for movida para Feito', () => {
        // Força a task a estar na coluna teste com executor e revisor definidos
        service.updateTask(taskId, {columnId: 'col-teste', executorId: 'dev-jaua', reviewerId: 'rev-diego'});

        service.moveTask(taskId, 'col-feito');

        const taskFinal = service.tasks().find(t => t.id === taskId);
        expect(taskFinal?.columnId).toBe('col-feito');
        expect(taskFinal?.executorId).toBe('dev-jaua');
        expect(taskFinal?.reviewerId).toBe('rev-diego');
      });
    });

    describe('Métricas Reativas e Alertas', () => {
      it('deve incluir tarefas atrasadas na lista de Alertas de Prazo', () => {
        // Simula data de ontem (Atrasada)
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        const dataFormatada = ontem.toISOString().split('T')[0];

        service.addTask({
          title: 'Tarefa Crítica Atrasada',
          columnId: 'col-progress',
          executorId: 'user-1',
          points: 3,
          dueDate: dataFormatada,
          checklist: []
        });

        const alertas = service.deadlineAlerts();
        expect(alertas.some(a => a.title === 'Tarefa Crítica Atrasada')).toBe(true);
      });
    });
  });
});
