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

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      isConnected: signal(true),
      plugins: signal(['system', 'quicklook', 'load', 'cpu', 'mem', 'network', 'diskio', 'fs', 'docker', 'gpu', 'sensors', 'processes']),
      isAuthenticated: signal(true),
      loginError: signal(null),
      gpu: signal([]),
      alerts: signal([]),
      version: signal('v4.0.0-mock'),
      showPerCpu: signal(false),
      processSortKey: signal('cpu_percent'),
      login: vi.fn(),
    };
  });

  it('should create the app', () => {
    const app = new AppComponent();
    expect(app).toBeTruthy();
    expect(app.isConnected()).toBe(true);
  });

  it('should toggle visibility signals on keydown', () => {
    const app = new AppComponent();
    
    // Testa o HostListener handleKeyDown de forma direta
    expect(app.showDocker()).toBe(true);
    app.handleKeyDown({ target: { tagName: 'DIV' }, key: 'D' } as any);
    expect(app.showDocker()).toBe(false);

    expect(app.showGpu()).toBe(true);
    app.handleKeyDown({ target: { tagName: 'DIV' }, key: 'g' } as any);
    expect(app.showGpu()).toBe(false);
  });
});
