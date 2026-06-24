import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signal } from '@angular/core';

let mockMetricsService: any;

vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<typeof import('@angular/core')>();
  return {
    ...original,
    inject: vi.fn((token) => {
      return mockMetricsService;
    })
  };
});

import { MemPluginComponent } from './mem-plugin.component';

describe('MemPluginComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      mem: signal({
        percent: 80,
        total: 16 * 1024 * 1024 * 1024,
        used: 12 * 1024 * 1024 * 1024,
        free: 4 * 1024 * 1024 * 1024,
        active: 8 * 1024 * 1024 * 1024,
        inactive: 4 * 1024 * 1024 * 1024,
        buffers: 512 * 1024 * 1024,
        cached: 1.5 * 1024 * 1024 * 1024,
        swap_percent: 5,
        swap_total: 2 * 1024 * 1024 * 1024,
        swap_used: 100 * 1024 * 1024,
        swap_free: 1.9 * 1024 * 1024 * 1024
      })
    };
  });

  it('should create the component', () => {
    const comp = new MemPluginComponent();
    expect(comp).toBeTruthy();
    expect(comp.mem().percent).toBe(80);
  });

  it('should format bytes with units correctly', () => {
    const comp = new MemPluginComponent();
    expect(comp.formatBytes(0)).toBe('0B');
    expect(comp.formatBytes(512)).toBe('512B');
    expect(comp.formatBytes(1024)).toBe('1K');
    expect(comp.formatBytes(1536)).toBe('1.5K');
    expect(comp.formatBytes(1024 * 1024)).toBe('1M');
    expect(comp.formatBytes(16 * 1024 * 1024 * 1024)).toBe('16G');
  });

  it('should return correct alert classes based on memory percentage', () => {
    const comp = new MemPluginComponent();
    expect(comp.getAlertClass(50)).toContain('ok');
    expect(comp.getAlertClass(76)).toContain('warning');
    expect(comp.getAlertClass(92)).toContain('critical');
  });
});
