import { WorkdayConversionPipe } from './workday-conversion.pipe';

describe('WorkdayConversionPipe', () => {
  let pipe: WorkdayConversionPipe;

  beforeEach(() => {
    pipe = new WorkdayConversionPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('deve converter pontos corretamente usando a regra ágil (5pts = 1 dia / 8h)', () => {
    // Testando valores fracionados menores que 5 pontos
    expect(pipe.transform(1)).toBe('0,2 dias (1,6h)');
    expect(pipe.transform(2)).toBe('0,4 dias (3,2h)');
    expect(pipe.transform(3)).toBe('0,6 dias (4,8h)');

    // Testando o valor exato de 1 dia inteiro
    expect(pipe.transform(5)).toBe('1 dia (8h)');

    // Testando valores maiores da sequência de Fibonacci
    expect(pipe.transform(8)).toBe('1,6 dias (12,8h)');
    expect(pipe.transform(13)).toBe('2,6 dias (20,8h)');
  });

  it('deve tratar valores zerados, nulos ou indefinidos de forma segura', () => {
    expect(pipe.transform(0)).toBe('0 dias (0h)');
    expect(pipe.transform(null)).toBe('0 dias (0h)');
    expect(pipe.transform(undefined)).toBe('0 dias (0h)');
  });
});
