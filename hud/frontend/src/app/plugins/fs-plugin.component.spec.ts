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

import { FsPluginComponent } from './fs-plugin.component';

describe('FsPluginComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      fs: signal([
        { mount: '/', device: '/dev/sda1', used: 40 * 1024 * 1024 * 1024, size: 100 * 1024 * 1024 * 1024, percent: 40 },
        { mount: '/data', device: '/dev/sdb1', used: 80 * 1024 * 1024 * 1024, size: 100 * 1024 * 1024 * 1024, percent: 80 }
      ])
    };
  });

  it('should create the component', () => {
    const comp = new FsPluginComponent();
    expect(comp).toBeTruthy();
    expect(comp.fs().length).toBe(2);
  });

  it('should return correct alert class based on disk usage percentage', () => {
    const comp = new FsPluginComponent();
    expect(comp.getAlertClass(40)).toBe('ok');
    expect(comp.getAlertClass(80)).toBe('warning');
    expect(comp.getAlertClass(95)).toBe('critical');
  });

  it('should format bytes correctly', () => {
    const comp = new FsPluginComponent();
    expect(comp.formatBytes(0)).toBe('0B');
    expect(comp.formatBytes(1024)).toBe('1K');
    expect(comp.formatBytes(1536)).toBe('1.5K');
    expect(comp.formatBytes(1024 * 1024)).toBe('1M');
    expect(comp.formatBytes(100 * 1024 * 1024 * 1024)).toBe('100G');
  });
});
