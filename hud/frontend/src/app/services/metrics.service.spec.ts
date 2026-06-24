import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock do DestroyRef do Angular para evitar injeções reais sem TestBed
const mockDestroyRef = {
  onDestroy: vi.fn()
};

vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<typeof import('@angular/core')>();
  return {
    ...original,
    inject: vi.fn((token) => {
      return mockDestroyRef;
    })
  };
});

import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;
  let mockEventSourceInstance: any;
  let originalEventSource: any;

  // Classe Mock real compatível com 'new'
  class MockEventSource {
    url: string;
    onopen?: Function;
    onmessage?: Function;
    onerror?: Function;
    close = vi.fn();

    constructor(url: string) {
      this.url = url;
      mockEventSourceInstance = this;
    }
  }

  beforeEach(() => {
    mockEventSourceInstance = null;
    originalEventSource = (global as any).EventSource;
    (global as any).EventSource = MockEventSource;

    // Mock das globais do navegador no Node.js
    global.localStorage = {
      getItem: vi.fn().mockReturnValue('dummy-token'),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn()
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ plugins: ['cpu', 'mem', 'processes'] })
    } as any);

    global.window = {
      location: {
        port: '4200',
        origin: 'http://localhost:4200',
        search: ''
      }
    } as any;

    service = new MetricsService();
  });

  afterEach(() => {
    (global as any).EventSource = originalEventSource;
    vi.restoreAllMocks();
  });

  it('should be created and connect to SSE', () => {
    expect(service).toBeTruthy();
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should format bytes rates correctly', () => {
    const serviceAny = service as any;
    expect(serviceAny.formatBytesRate(0)).toBe('0 B/s');
    expect(serviceAny.formatBytesRate(1500)).toBe('1.5 Kb/s');
    expect(serviceAny.formatBytesRate(2500000)).toBe('2.5 Mb/s');
  });

  it('should update metrics state when SSE message arrives', () => {
    if (mockEventSourceInstance && mockEventSourceInstance.onopen) {
      mockEventSourceInstance.onopen();
    }
    expect(service.isConnected()).toBe(true);

    const mockMetrics = {
      version: 'v4.0.0-test',
      uptime: '1:30:15',
      cpu: { total: 45 },
      mem: { total: 16000000, used: 8000000 },
      processlist: [
        { pid: 101, cpu_percent: 5, name: 'processA' },
        { pid: 102, cpu_percent: 25, name: 'processB' }
      ]
    };

    if (mockEventSourceInstance && mockEventSourceInstance.onmessage) {
      mockEventSourceInstance.onmessage({ data: JSON.stringify(mockMetrics) });
    }

    expect(service.metrics()).toEqual(mockMetrics);
    expect(service.cpu()?.total).toBe(45);
    
    // Validar ordenação reativa por CPU decrescente
    const sorted = service.processes();
    expect(sorted).toBeTruthy();
    expect(sorted![0].pid).toBe(102); // 25% CPU
    expect(sorted![1].pid).toBe(101); // 5% CPU
  });

  it('should change process sorting key and re-sort processes dynamically', () => {
    const mockMetrics = {
      processlist: [
        { pid: 101, cpu_percent: 15, memory_percent: 1, name: 'processA' },
        { pid: 102, cpu_percent: 5, memory_percent: 10, name: 'processB' }
      ]
    };

    if (mockEventSourceInstance && mockEventSourceInstance.onmessage) {
      mockEventSourceInstance.onmessage({ data: JSON.stringify(mockMetrics) });
    }

    // Por CPU -> processA (15%)
    expect(service.processes()![0].pid).toBe(101);

    // Mudar para ordenar por memória (mem_percent)
    service.processSortKey.set('mem_percent');
    
    // Por memória -> processB (10% Memória)
    expect(service.processes()![0].pid).toBe(102);
  });
});
