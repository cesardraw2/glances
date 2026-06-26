import { FormatBytesPipe } from './format-bytes.pipe';

describe('FormatBytesPipe', () => {
  let pipe: FormatBytesPipe;

  beforeEach(() => {
    pipe = new FormatBytesPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return 0B for 0 or falsy values', () => {
    expect(pipe.transform(0)).toBe('0B');
    expect(pipe.transform(null as any)).toBe('0B');
    expect(pipe.transform(undefined as any)).toBe('0B');
  });

  it('should format bytes with units correctly', () => {
    expect(pipe.transform(512)).toBe('512B');
    expect(pipe.transform(1024)).toBe('1K');
    expect(pipe.transform(1536)).toBe('1.5K');
    expect(pipe.transform(1024 * 1024)).toBe('1M');
    expect(pipe.transform(100 * 1024 * 1024 * 1024)).toBe('100G');
  });
});
