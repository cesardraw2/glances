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

import { DiskIoPluginComponent } from './diskio-plugin.component';

describe('DiskIoPluginComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      diskio: signal([
        { device: 'sda', read_rate: '1.2 Mb/s', write_rate: '400 Kb/s' },
        { device: 'nvme0n1', read_rate: '0 B/s', write_rate: '0 B/s' }
      ])
    };
  });

  it('should create the component', () => {
    const comp = new DiskIoPluginComponent();
    expect(comp).toBeTruthy();
    expect(comp.diskio().length).toBe(2);
  });

  it('should format rate correctly', () => {
    const comp = new DiskIoPluginComponent();
    expect(comp.formatRate('1.2 Mb/s')).toBe('1.2Mb/s');
    expect(comp.formatRate('0 B/s')).toBe('0B/s');
  });
});
