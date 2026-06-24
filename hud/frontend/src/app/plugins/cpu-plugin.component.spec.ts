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

import { CpuPluginComponent } from './cpu-plugin.component';

describe('CpuPluginComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      cpu: signal({
        total: 45,
        user: 20,
        system: 15,
        idle: 55,
        nice: 0,
        irq: 1,
        iowait: 4,
        steal: 0,
        ctx_switches: 12000,
        interrupts: 8000,
        soft_interrupts: 150,
        cores: [
          { id: 0, percent: 30 },
          { id: 1, percent: 60 }
        ]
      }),
      showPerCpu: signal(true)
    };
  });

  it('should create the component', () => {
    const comp = new CpuPluginComponent();
    expect(comp).toBeTruthy();
    expect(comp.cpu().total).toBe(45);
    expect(comp.showPerCpu()).toBe(true);
  });

  it('should return correct alert classes based on cpu percent', () => {
    const comp = new CpuPluginComponent();
    expect(comp.getAlertClass(45)).toContain('ok');
    expect(comp.getAlertClass(75)).toContain('warning');
    expect(comp.getAlertClass(95)).toContain('critical');
  });

  it('should return correct badge classes based on cpu percent', () => {
    const comp = new CpuPluginComponent();
    expect(comp.getBadgeClass(45, 'user')).toBe('bg-ok');
    expect(comp.getBadgeClass(75, 'user')).toBe('bg-warning');
    expect(comp.getBadgeClass(95, 'user')).toBe('bg-critical');
  });
});
