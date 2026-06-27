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

});
