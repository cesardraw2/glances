import { FormatRatePipe } from './format-rate.pipe';

describe('FormatRatePipe', () => {
  let pipe: FormatRatePipe;

  beforeEach(() => {
    pipe = new FormatRatePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should remove " /s" and spaces from strings', () => {
    expect(pipe.transform('2.5 Kb/s')).toBe('2.5Kb/s');
    expect(pipe.transform('0 B/s')).toBe('0B/s');
    expect(pipe.transform('100 Mb/s')).toBe('100Mb/s');
  });

  it('should return empty string for falsy input', () => {
    expect(pipe.transform(null as any)).toBe('0');
    expect(pipe.transform(undefined as any)).toBe('0');
    expect(pipe.transform('')).toBe('');
  });
});
