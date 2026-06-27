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

import { LoadPluginComponent } from './load-plugin.component';

describe('LoadPluginComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      load: signal({
        cpucore: 4,
        min1: 0.5,
        min5: 0.75,
        min15: 0.95
      })
    };
  });

  it('should create the component', () => {
    const comp = new LoadPluginComponent();
    expect(comp).toBeTruthy();
    expect(comp.load().cpucore).toBe(4);
  });

  it('should format values to 2 decimal places with padding', () => {
    const comp = new LoadPluginComponent();
    expect(comp.formatValue(0.5)).toBe(' 0.50');
    expect(comp.formatValue(12.3456)).toBe('12.35');
  });

  it('should return correct alert classes based on value thresholds', () => {
    const comp = new LoadPluginComponent();
    expect(comp.getAlertClass(0.5)).toContain('bg-ok');
    expect(comp.getAlertClass(0.75)).toContain('bg-warning');
    expect(comp.getAlertClass(0.95)).toContain('bg-critical');
  });
});
