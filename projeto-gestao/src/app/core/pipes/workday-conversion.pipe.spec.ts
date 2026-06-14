import { WorkdayConversionPipe } from './workday-conversion.pipe';

describe('WorkdayConversionPipe', () => {
  let pipe: WorkdayConversionPipe;

  beforeEach(() => {
    pipe = new WorkdayConversionPipe();
  });

  it('deve converter pontos corretamente para dias e horas comerciais', () => {
    expect(pipe.transform(1)).toBe('1 dia (8h)');
    expect(pipe.transform(2)).toBe('2 dias (16h)');
    expect(pipe.transform(5)).toBe('5 dias (40h)');
    expect(pipe.transform(0)).toBe('0 dias (0h)');
    expect(pipe.transform(null)).toBe('0 dias (0h)');
  });
});
