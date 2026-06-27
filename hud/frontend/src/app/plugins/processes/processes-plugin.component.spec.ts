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

import { ProcessesPluginComponent } from './processes-plugin.component';

describe('ProcessesPluginComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      processes: signal([
        { pid: 101, name: 'node-app', cpu_percent: 5.5, memory_percent: 1.2, memory_info: { vms: 1024 * 1024 * 1024, rss: 150 * 1024 * 1024 }, cpu_times: { user: 120, system: 30 }, num_threads: 4, nice: 0, status: 'running', username: 'root' },
        { pid: 102, name: 'chrome-helper', cpu_percent: 85.0, memory_percent: 10.0, cpu_times: null, num_threads: 12, nice: 0, status: 'sleeping', username: 'cesardraw' }
      ]),
      processcount: signal({ total: 2, thread: 16, running: 1, sleeping: 1 }),
      processSortKey: {
        set: vi.fn()
      },
      extendedProcess: signal(null),
      pinProcess: vi.fn(),
      unpinProcess: vi.fn()
    };
  });

  it('should create the component', () => {
    const comp = new ProcessesPluginComponent();
    expect(comp).toBeTruthy();
    expect(comp.processes().length).toBe(2);
  });

  it('should change sorting key on metrics service', () => {
    const comp = new ProcessesPluginComponent();
    comp.changeSort('mem_percent');
    expect(mockMetricsService.processSortKey.set).toHaveBeenCalledWith('mem_percent');
  });

  it('should pin process when it is not already pinned', () => {
    const comp = new ProcessesPluginComponent();
    comp.pin(101);
    expect(mockMetricsService.pinProcess).toHaveBeenCalledWith(101);
  });

  it('should unpin process when pinning the already pinned process', () => {
    mockMetricsService.extendedProcess.set({ pid: 101, name: 'node-app' });
    const comp = new ProcessesPluginComponent();
    comp.pin(101);
    expect(mockMetricsService.unpinProcess).toHaveBeenCalled();
  });

  it('should return correct CPU status class', () => {
    const comp = new ProcessesPluginComponent();
    expect(comp.cpuClass(10)).toBe('ok');
    expect(comp.cpuClass(60)).toBe('warning');
    expect(comp.cpuClass(85)).toBe('critical');
  });

  it('should retrieve correct virt and res memory strings (real and mocks)', () => {
    const comp = new ProcessesPluginComponent();
    // Real memory_info
    expect(comp.getVirt(mockMetricsService.processes()[0])).toBe('1G');
    expect(comp.getRes(mockMetricsService.processes()[0])).toBe('150M');
    
    // Mock fallbacks based on process name
    expect(comp.getVirt(mockMetricsService.processes()[1])).toBe('3.02G');
    expect(comp.getRes(mockMetricsService.processes()[1])).toBe('300M');
  });

  it('should format process time correctly', () => {
    const comp = new ProcessesPluginComponent();
    expect(comp.formatProcessTime({ user: 120, system: 30 })).toBe('2:30.00');
    expect(comp.formatProcessTime({ user: 3600, system: 120 })).toBe('1h02');
    expect(comp.formatProcessTime(null)).toBe('00:00.00');
  });

  it('should map process statuses correctly', () => {
    const comp = new ProcessesPluginComponent();
    expect(comp.getProcessStatus({ status: 'running' })).toBe('R');
    expect(comp.getProcessStatus({ status: 'S' })).toBe('S');
    expect(comp.getProcessStatus({ status: 'zombie' })).toBe('Z');
    
    expect(comp.isProcessRunning({ status: 'running' })).toBe(true);
    expect(comp.isProcessRunning({ status: 'sleeping' })).toBe(false);
  });
});
