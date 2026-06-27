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

import { GpuPluginComponent } from './gpu-plugin.component';

describe('GpuPluginComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      gpu: signal([
        { gpu_id: 0, name: 'NVIDIA RTX 4090', proc: 12, mem: 45 },
        { gpu_id: 1, name: 'Intel UHD Graphics', proc: 0, mem: 0 }
      ])
    };
  });

  it('should create the component', () => {
    const comp = new GpuPluginComponent();
    expect(comp).toBeTruthy();
    expect(comp.gpu().length).toBe(2);
    expect(comp.gpu()[0].name).toBe('NVIDIA RTX 4090');
  });
});
