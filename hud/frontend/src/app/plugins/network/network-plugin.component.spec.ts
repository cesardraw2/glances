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

import { NetworkPluginComponent } from './network-plugin.component';

describe('NetworkPluginComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      network: signal([
        { interface: 'eth0', rx_rate: '2.5 Kb/s', tx_rate: '150 B/s' },
        { interface: 'wlan0', rx_rate: '0 B/s', tx_rate: '0 B/s' }
      ])
    };
  });

  it('should create the component', () => {
    const comp = new NetworkPluginComponent();
    expect(comp).toBeTruthy();
    expect(comp.network().length).toBe(2);
  });

});
