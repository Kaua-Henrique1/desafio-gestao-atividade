import { TestBed } from '@angular/core/testing';
import { CountdownPipe } from './countdown.pipe';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

describe('CountdownPipe', () => {
  let pipe: CountdownPipe;

  beforeEach(() => {
    // Inicializa o módulo de teste isolado para cada execução
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [CountdownPipe] });
    pipe = TestBed.inject(CountdownPipe);

    // Trava o relógio no Vitest (14 de Junho de 2026)
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 14));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve criar a instância', () => {
    expect(pipe).toBeTruthy();
  });

  it('deve retornar "✓ Concluída" se a tarefa estiver na coluna Feito', () => {
    const resultado = pipe.transform('2026-06-30', 'col-feito');
    expect(resultado).toBe('✓ Concluída');
  });

  it('deve retornar "⚠️ Entrega HOJE!" para a data atual nas colunas ativas', () => {
    const resultado = pipe.transform('2026-06-14', 'col-progress');
    expect(resultado).toBe('⚠️ Entrega HOJE!');
  });

  it('deve retornar o indicador de dias restantes para prazos futuros', () => {
    const resultado = pipe.transform('2026-06-16', 'col-progress');
    expect(resultado).toBe('📅 2 dias restantes');
  });

  it('deve retornar o alerta de atraso para datas passadas', () => {
    const resultado = pipe.transform('2026-06-12', 'col-progress');
    expect(resultado).toBe('🚨 ATRASADO (2 dias)');
  });
});
