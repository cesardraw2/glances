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

import { SystemInfoComponent } from './system-info.component';

describe('SystemInfoComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      system: signal({
        hostname: 'test-host',
        system: 'Linux',
        release: '5.15.0',
        uptime: 3600
      }),
      ipAddress: signal('192.168.1.10'),
      publicIp: signal('200.100.50.25')
    };
  });

  it('should create the component', () => {
    const comp = new SystemInfoComponent();
    expect(comp).toBeTruthy();
    expect(comp.system().hostname).toBe('test-host');
  });

  it('should format uptime correctly', () => {
    const comp = new SystemInfoComponent();
    expect(comp.formatUptime(0)).toBe('0:00:00');
    expect(comp.formatUptime(3665)).toBe('1:01:05');
  });

  it('should format uptime value handling strings and numbers', () => {
    const comp = new SystemInfoComponent();
    expect(comp.formatUptimeValue('2 days, 05:10:00')).toBe('2 days, 05:10:00');
    expect(comp.formatUptimeValue(120)).toBe('0:02:00');
  });
});
