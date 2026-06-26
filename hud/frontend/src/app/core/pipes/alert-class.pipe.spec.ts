import { AlertClassPipe } from './alert-class.pipe';

describe('AlertClassPipe', () => {
  let pipe: AlertClassPipe;

  beforeEach(() => {
    pipe = new AlertClassPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return ok classes for low percentages (< 70)', () => {
    expect(pipe.transform(40)).toBe('ok font-bold');
    expect(pipe.transform(40, 'text')).toBe('ok font-bold');
    expect(pipe.transform(40, 'bg')).toBe('bg-ok');
  });

  it('should return warning classes for medium percentages (70 <= x < 90)', () => {
    expect(pipe.transform(75)).toBe('warning font-bold');
    expect(pipe.transform(75, 'bg')).toBe('bg-warning');
  });

  it('should return critical classes for high percentages (>= 90)', () => {
    expect(pipe.transform(95)).toBe('critical font-bold');
    expect(pipe.transform(95, 'bg')).toBe('bg-critical');
  });

  it('should handle falsy values gracefully', () => {
    expect(pipe.transform(null as any)).toBe('');
    expect(pipe.transform(undefined as any)).toBe('');
  });
});
