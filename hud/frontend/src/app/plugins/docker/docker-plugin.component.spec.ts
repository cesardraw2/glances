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

import { DockerPluginComponent } from './docker-plugin.component';

describe('DockerPluginComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      containers: signal([
        { id: '123', name: 'web-app', status: 'running', uptime: 'Up 2 hours', cpu_percent: 1.5, memory_usage: 120 * 1024 * 1024, memory_limit: 512 * 1024 * 1024, io: { ior: 0, iow: 0 }, network: { rx: 1024, tx: 512 }, ports: '80->80', command: 'node index.js' },
        { id: '456', name: 'db', status: 'exited', uptime: 'Exited 1 hour ago', cpu_percent: 0.0, memory_usage: 0, memory_limit: 1024 * 1024 * 1024, io: { ior: 0, iow: 0 }, network: { rx: 0, tx: 0 }, ports: '5432->5432', command: ['postgres', '-D', '/data'] }
      ]),
      containerSortKey: {
        set: vi.fn()
      }
    };
  });

  it('should create the component', () => {
    const comp = new DockerPluginComponent();
    expect(comp).toBeTruthy();
    expect(comp.containers().length).toBe(2);
  });

  it('should change sorting key on metrics service', () => {
    const comp = new DockerPluginComponent();
    comp.changeSort('cpu_percent');
    expect(mockMetricsService.containerSortKey.set).toHaveBeenCalledWith('cpu_percent');
  });



});
