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
    mockDestroyRef.onDestroy = vi.fn();

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

  // ═══════════════════════════════════════════════════════════════
  // Criação e Conexão SSE
  // ═══════════════════════════════════════════════════════════════

  it('should be created and connect to SSE', () => {
    expect(service).toBeTruthy();
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should register destroyRef.onDestroy callbacks', async () => {
    // Espera o constructor async resolver
    await vi.waitFor(() => {
      expect(mockDestroyRef.onDestroy).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // formatBytesRate (private — acessível via cast)
  // ═══════════════════════════════════════════════════════════════

  describe('formatBytesRate', () => {
    it('should return "0 B/s" for zero', () => {
      expect((service as any).formatBytesRate(0)).toBe('0 B/s');
    });

    it('should return "0 B/s" for null/undefined/NaN', () => {
      expect((service as any).formatBytesRate(null)).toBe('0 B/s');
      expect((service as any).formatBytesRate(undefined)).toBe('0 B/s');
      expect((service as any).formatBytesRate(NaN)).toBe('0 B/s');
    });

    it('should format B/s correctly', () => {
      expect((service as any).formatBytesRate(500)).toBe('500 B/s');
    });

    it('should format Kb/s correctly', () => {
      expect((service as any).formatBytesRate(1500)).toBe('1.5 Kb/s');
    });

    it('should format Mb/s correctly', () => {
      expect((service as any).formatBytesRate(2500000)).toBe('2.5 Mb/s');
    });

    it('should format Gb/s correctly', () => {
      expect((service as any).formatBytesRate(3500000000)).toBe('3.5 Gb/s');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Computed: system
  // ═══════════════════════════════════════════════════════════════

  describe('system computed', () => {
    it('should return null when no metrics', () => {
      expect(service.system()).toBeNull();
    });

    it('should return system data with uptime from root level', () => {
      service.metrics.set({
        system: { os_name: 'Linux', hostname: 'test-host' },
        uptime: '2:15:30'
      });
      expect(service.system()).toEqual({
        os_name: 'Linux',
        hostname: 'test-host',
        uptime: '2:15:30'
      });
    });

    it('should fallback to system.uptime if root uptime is missing', () => {
      service.metrics.set({
        system: { os_name: 'Linux', uptime: '1:00:00' }
      });
      expect(service.system()!.uptime).toBe('1:00:00');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Computed: ipAddress
  // ═══════════════════════════════════════════════════════════════

  describe('ipAddress computed', () => {
    it('should return empty string when no ip data', () => {
      service.metrics.set({});
      expect(service.ipAddress()).toBe('');
    });

    it('should return address with CIDR mask', () => {
      service.metrics.set({ ip: { address: '192.168.1.10', mask_cidr: 24 } });
      expect(service.ipAddress()).toBe('192.168.1.10/24');
    });

    it('should return address only when no mask_cidr', () => {
      service.metrics.set({ ip: { address: '10.0.0.1' } });
      expect(service.ipAddress()).toBe('10.0.0.1');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Computed: publicIp
  // ═══════════════════════════════════════════════════════════════

  describe('publicIp computed', () => {
    it('should return empty string when no public IP', () => {
      service.metrics.set({});
      expect(service.publicIp()).toBe('');
    });

    it('should return publicip when available', () => {
      service.metrics.set({ publicip: '1.2.3.4' });
      expect(service.publicIp()).toBe('1.2.3.4');
    });

    it('should return public_ip as fallback', () => {
      service.metrics.set({ public_ip: '5.6.7.8' });
      expect(service.publicIp()).toBe('5.6.7.8');
    });

    it('should return empty string when publicip is "None"', () => {
      service.metrics.set({ publicip: 'None' });
      expect(service.publicIp()).toBe('');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Computed: cpu (com percpu/cores)
  // ═══════════════════════════════════════════════════════════════

  describe('cpu computed', () => {
    it('should return null when no cpu data', () => {
      service.metrics.set({});
      expect(service.cpu()).toBeNull();
    });

    it('should map percpu to cores array', () => {
      service.metrics.set({
        cpu: { total: 55 },
        percpu: [
          { cpu_number: 0, total: 30 },
          { cpu_number: 1, total: 80 }
        ]
      });
      const cpu = service.cpu();
      expect(cpu!.total).toBe(55);
      expect(cpu!.cores).toHaveLength(2);
      expect(cpu!.cores[0]).toEqual({ id: 0, percent: 30 });
      expect(cpu!.cores[1]).toEqual({ id: 1, percent: 80 });
    });

    it('should handle cpu without percpu data', () => {
      service.metrics.set({ cpu: { total: 10 } });
      expect(service.cpu()!.cores).toBeUndefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Computed: mem (com swap)
  // ═══════════════════════════════════════════════════════════════

  describe('mem computed', () => {
    it('should return null when no mem data', () => {
      service.metrics.set({});
      expect(service.mem()).toBeNull();
    });

    it('should merge mem with memswap data', () => {
      service.metrics.set({
        mem: { total: 16000000, used: 61208000, percent: 50 },
        memswap: { total: 4000000, used: 1000000, free: 3000000, percent: 25 }
      });
      const mem = service.mem();
      expect(mem!.total).toBe(16000000);
      expect(mem!.swap_total).toBe(4000000);
      expect(mem!.swap_used).toBe(1000000);
      expect(mem!.swap_free).toBe(3000000);
      expect(mem!.swap_percent).toBe(25);
    });

    it('should default swap values to 0 when memswap is missing', () => {
      service.metrics.set({ mem: { total: 61208000 } });
      const mem = service.mem();
      expect(mem!.swap_total).toBe(0);
      expect(mem!.swap_used).toBe(0);
      expect(mem!.swap_free).toBe(0);
      expect(mem!.swap_percent).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Computed: network (filtragem + normalização)
  // ═══════════════════════════════════════════════════════════════

  describe('network computed', () => {
    it('should return null when no network data', () => {
      service.metrics.set({});
      expect(service.network()).toBeNull();
    });

    it('should filter out virtual interfaces with low traffic', () => {
      service.metrics.set({
        network: [
          { interface_name: 'eth0', bytes_recv_rate_per_sec: 5000, bytes_sent_rate_per_sec: 3000 },
          { interface_name: 'veth123', bytes_recv_rate_per_sec: 100, bytes_sent_rate_per_sec: 50 },
          { interface_name: 'br-abc', bytes_recv_rate_per_sec: 0, bytes_sent_rate_per_sec: 0 },
        ]
      });
      const net = service.network();
      expect(net).toHaveLength(1);
      expect(net![0].interface).toBe('eth0');
    });

    it('should keep virtual interfaces with high traffic', () => {
      service.metrics.set({
        network: [
          { interface_name: 'docker0', bytes_recv_rate_per_sec: 50000, bytes_sent_rate_per_sec: 100 },
        ]
      });
      const net = service.network();
      expect(net).toHaveLength(1);
      expect(net![0].interface).toBe('docker0');
    });

    it('should normalize interface data with formatted rates', () => {
      service.metrics.set({
        network: [
          { interface_name: 'wlan0', bytes_recv_rate_per_sec: 1500000, bytes_sent_rate_per_sec: 500000, speed: 1000 },
        ]
      });
      const net = service.network();
      expect(net![0].rx_rate).toBe('1.5 Mb/s');
      expect(net![0].tx_rate).toBe('500 Kb/s');
      expect(net![0].speed).toBe(1000);
    });

    it('should pass through already-normalized data (with "interface" key)', () => {
      service.metrics.set({
        network: [
          { interface: 'lo', rx_rate: '100 B/s', tx_rate: '100 B/s' },
        ]
      });
      const net = service.network();
      expect(net![0].interface).toBe('lo');
      expect(net![0].rx_rate).toBe('100 B/s');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Computed: diskio (filtragem + normalização)
  // ═══════════════════════════════════════════════════════════════

  describe('diskio computed', () => {
    it('should return null when no diskio data', () => {
      service.metrics.set({});
      expect(service.diskio()).toBeNull();
    });

    it('should filter out loop and ram devices', () => {
      service.metrics.set({
        diskio: [
          { disk_name: 'sda', read_bytes_rate_per_sec: 1000, write_bytes_rate_per_sec: 500 },
          { disk_name: 'loop0', read_bytes_rate_per_sec: 0, write_bytes_rate_per_sec: 0 },
          { disk_name: 'ram0', read_bytes_rate_per_sec: 0, write_bytes_rate_per_sec: 0 },
        ]
      });
      const disk = service.diskio();
      expect(disk).toHaveLength(1);
      expect(disk![0].device).toBe('sda');
    });

    it('should normalize disk data with formatted rates', () => {
      service.metrics.set({
        diskio: [
          { disk_name: 'nvme0n1', read_bytes_rate_per_sec: 2000000, write_bytes_rate_per_sec: 500000 },
        ]
      });
      const disk = service.diskio();
      expect(disk![0].read_rate).toBe('2 Mb/s');
      expect(disk![0].write_rate).toBe('500 Kb/s');
    });

    it('should pass through already-normalized data (with "device" key)', () => {
      service.metrics.set({
        diskio: [
          { device: 'sdb', read_rate: '0 B/s', write_rate: '0 B/s' },
        ]
      });
      const disk = service.diskio();
      expect(disk![0].device).toBe('sdb');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Computed: fs (normalização)
  // ═══════════════════════════════════════════════════════════════

  describe('fs computed', () => {
    it('should return null when no fs data', () => {
      service.metrics.set({});
      expect(service.fs()).toBeNull();
    });

    it('should normalize fs data from Glances format', () => {
      service.metrics.set({
        fs: [
          { device_name: '/dev/sda1', mnt_point: '/', size: 100000, used: 50000, free: 50000, percent: 50 },
        ]
      });
      const fs = service.fs();
      expect(fs![0]).toEqual({
        device: '/dev/sda1', mount: '/', size: 100000, used: 50000, free: 50000, percent: 50
      });
    });

    it('should pass through already-normalized fs data', () => {
      service.metrics.set({
        fs: [
          { mount: '/home', device: '/dev/sda2', size: 200000, used: 100000 },
        ]
      });
      const fs = service.fs();
      expect(fs![0].mount).toBe('/home');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Computed: containers (sorting)
  // ═══════════════════════════════════════════════════════════════

  describe('containers computed', () => {
    it('should return empty array when no containers', () => {
      service.metrics.set({});
      expect(service.containers()).toEqual([]);
    });

    it('should sort by cpu_percent by default', () => {
      service.metrics.set({
        containers: [
          { name: 'web', cpu_percent: 10 },
          { name: 'db', cpu_percent: 50 },
        ]
      });
      const c = service.containers();
      expect(c[0].name).toBe('db');
      expect(c[1].name).toBe('web');
    });

    it('should sort by memory_usage', () => {
      service.containerSortKey.set('memory_usage');
      service.metrics.set({
        containers: [
          { name: 'small', memory_usage: 100 },
          { name: 'big', memory_usage: 9000 },
        ]
      });
      const c = service.containers();
      expect(c[0].name).toBe('big');
    });

    it('should sort by memory.usage as fallback', () => {
      service.containerSortKey.set('memory_usage');
      service.metrics.set({
        containers: [
          { name: 'a', memory: { usage: 200 } },
          { name: 'b', memory: { usage: 5000 } },
        ]
      });
      const c = service.containers();
      expect(c[0].name).toBe('b');
    });

    it('should sort by name alphabetically', () => {
      service.containerSortKey.set('name');
      service.metrics.set({
        containers: [
          { name: 'zeta' },
          { name: 'alpha' },
          { name: 'beta' },
        ]
      });
      const c = service.containers();
      expect(c[0].name).toBe('alpha');
      expect(c[1].name).toBe('beta');
      expect(c[2].name).toBe('zeta');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Computed: processes (sorting avançado)
  // ═══════════════════════════════════════════════════════════════

  describe('processes computed', () => {
    it('should return null when no processes', () => {
      service.metrics.set({});
      expect(service.processes()).toBeNull();
    });

    it('should use processlist as fallback for processes key', () => {
      service.metrics.set({
        processlist: [
          { pid: 1, cpu_percent: 5, name: 'init' }
        ]
      });
      expect(service.processes()).toHaveLength(1);
      expect(service.processes()![0].pid).toBe(1);
    });

    it('should sort by cpu_percent descending (default)', () => {
      service.metrics.set({
        processlist: [
          { pid: 1, cpu_percent: 5 },
          { pid: 2, cpu_percent: 25 },
        ]
      });
      expect(service.processes()![0].pid).toBe(2);
    });

    it('should sort by mem_percent (with memory_percent fallback)', () => {
      service.processSortKey.set('mem_percent');
      service.metrics.set({
        processlist: [
          { pid: 1, memory_percent: 2 },
          { pid: 2, mem_percent: 10 },
        ]
      });
      expect(service.processes()![0].pid).toBe(2);
      expect(service.processes()![1].pid).toBe(1);
    });

    it('should sort by time (cpu_times.user + system)', () => {
      service.processSortKey.set('time');
      service.metrics.set({
        processlist: [
          { pid: 1, cpu_times: { user: 10, system: 5 } },
          { pid: 2, cpu_times: { user: 100, system: 50 } },
          { pid: 3 }, // sem cpu_times
        ]
      });
      const sorted = service.processes()!;
      expect(sorted[0].pid).toBe(2); // 150
      expect(sorted[1].pid).toBe(1); // 15
      expect(sorted[2].pid).toBe(3); // 0
    });

    it('should sort by io (io_counters[2] + io_counters[3])', () => {
      service.processSortKey.set('io');
      service.metrics.set({
        processlist: [
          { pid: 1, io_counters: [0, 0, 100, 200, 0] },
          { pid: 2, io_counters: [0, 0, 500, 500, 0] },
          { pid: 3 }, // sem io_counters
        ]
      });
      const sorted = service.processes()!;
      expect(sorted[0].pid).toBe(2); // 1000
      expect(sorted[1].pid).toBe(1); // 300
      expect(sorted[2].pid).toBe(3); // 0
    });

    it('should sort by name alphabetically', () => {
      service.processSortKey.set('name');
      service.metrics.set({
        processlist: [
          { pid: 1, name: 'Zsh' },
          { pid: 2, name: 'bash' },
          { pid: 3, name: 'Apache' },
        ]
      });
      const sorted = service.processes()!;
      expect(sorted[0].name).toBe('Apache');
      expect(sorted[1].name).toBe('bash');
      expect(sorted[2].name).toBe('Zsh');
    });

    it('should sort by username alphabetically', () => {
      service.processSortKey.set('username');
      service.metrics.set({
        processlist: [
          { pid: 1, username: 'root' },
          { pid: 2, username: 'admin' },
          { pid: 3, username: 'cesar' },
        ]
      });
      const sorted = service.processes()!;
      expect(sorted[0].username).toBe('admin');
      expect(sorted[1].username).toBe('cesar');
      expect(sorted[2].username).toBe('root');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Computed: extendedProcess
  // ═══════════════════════════════════════════════════════════════

  describe('extendedProcess computed', () => {
    it('should return null when no processes', () => {
      service.metrics.set({});
      expect(service.extendedProcess()).toBeNull();
    });

    it('should return null when no process has extended_stats', () => {
      service.metrics.set({
        processlist: [{ pid: 1 }, { pid: 2 }]
      });
      expect(service.extendedProcess()).toBeNull();
    });

    it('should return the process with extended_stats === true', () => {
      service.metrics.set({
        processlist: [
          { pid: 1, extended_stats: false },
          { pid: 42, extended_stats: true, name: 'pinned' },
        ]
      });
      expect(service.extendedProcess()!.pid).toBe(42);
      expect(service.extendedProcess()!.name).toBe('pinned');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Computed: alerts, version, load, sensors, gpu, processcount
  // ═══════════════════════════════════════════════════════════════

  describe('simple computed signals', () => {
    it('should expose alerts (defaults to empty array)', () => {
      service.metrics.set({});
      expect(service.alerts()).toEqual([]);
    });

    it('should expose alerts from metrics', () => {
      service.metrics.set({ alert: [{ msg: 'test' }] });
      expect(service.alerts()).toEqual([{ msg: 'test' }]);
    });

    it('should expose version', () => {
      service.metrics.set({ version: '4.2.0' });
      expect(service.version()).toBe('4.2.0');
    });

    it('should expose load', () => {
      service.metrics.set({ load: { min1: 0.5, min5: 0.7, min15: 0.9, cpucore: 8 } });
      expect(service.load()!.min1).toBe(0.5);
    });

    it('should expose sensors', () => {
      service.metrics.set({ sensors: [{ label: 'CPU Temp', value: 65, unit: '°C' }] });
      expect(service.sensors()![0].value).toBe(65);
    });

    it('should expose gpu', () => {
      service.metrics.set({ gpu: [{ name: 'GTX 1080', mem: 50, proc: 80 }] });
      expect(service.gpu()![0].name).toBe('GTX 1080');
    });

    it('should expose processcount', () => {
      service.metrics.set({ processcount: { total: 250, running: 3, sleeping: 247 } });
      expect(service.processcount()!.total).toBe(250);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SSE: onopen, onmessage, onerror
  // ═══════════════════════════════════════════════════════════════

  describe('SSE lifecycle', () => {
    it('should set isConnected on SSE open', async () => {
      await vi.waitFor(() => expect(mockEventSourceInstance).toBeTruthy());
      mockEventSourceInstance.onopen!();
      expect(service.isConnected()).toBe(true);
    });

    it('should update metrics on SSE message', async () => {
      await vi.waitFor(() => expect(mockEventSourceInstance).toBeTruthy());
      const data = { cpu: { total: 77 }, version: '4.0.0' };
      mockEventSourceInstance.onmessage!({ data: JSON.stringify(data) });
      expect(service.metrics()).toEqual(data);
    });

    it('should handle invalid JSON gracefully on SSE message', async () => {
      await vi.waitFor(() => expect(mockEventSourceInstance).toBeTruthy());
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockEventSourceInstance.onmessage!({ data: 'not-json{{{' });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should close EventSource and set disconnected on SSE error', async () => {
      await vi.waitFor(() => expect(mockEventSourceInstance).toBeTruthy());
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const currentES = mockEventSourceInstance;
      currentES.onerror!({});
      expect(service.isConnected()).toBe(false);
      expect(currentES.close).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SSE URL construction
  // ═══════════════════════════════════════════════════════════════

  describe('SSE URL construction', () => {
    it('should include token in SSE URL when available', async () => {
      await vi.waitFor(() => expect(mockEventSourceInstance).toBeTruthy());
      expect(mockEventSourceInstance.url).toContain('token=dummy-token');
    });

    it('should include refresh param in SSE URL when in query string', async () => {
      (global.window as any).location.search = '?refresh=5';
      vi.mocked(global.localStorage.getItem).mockReturnValue('my-token');

      // Conecta manualmente com a nova configuração
      (service as any).connectSSE('my-token');
      await vi.waitFor(() => expect(mockEventSourceInstance).toBeTruthy());
      expect(mockEventSourceInstance.url).toContain('refresh=5');
      expect(mockEventSourceInstance.url).toContain('token=my-token');
    });

    it('should not include query string when no token and no refresh', async () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);
      (global.window as any).location.search = '';

      (service as any).connectSSE(null);
      await vi.waitFor(() => expect(mockEventSourceInstance).toBeTruthy());
      expect(mockEventSourceInstance.url).not.toContain('?');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // getBaseUrl / getApiVersionPath
  // ═══════════════════════════════════════════════════════════════

  describe('getBaseUrl and getApiVersionPath', () => {
    it('should use localhost:61208 for dev port 4200', () => {
      (global.window as any).location.port = '4200';
      expect((service as any).getBaseUrl()).toBe('http://localhost:61208');
      expect((service as any).getApiVersionPath()).toBe('api');
    });

    it('should use window origin for production port', () => {
      (global.window as any).location.port = '61208';
      (global.window as any).location.origin = 'http://myserver:61208';
      expect((service as any).getBaseUrl()).toBe('http://myserver:61208');
      expect((service as any).getApiVersionPath()).toBe('api/4');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // getHeaders
  // ═══════════════════════════════════════════════════════════════

  describe('getHeaders', () => {
    it('should return Authorization header when token exists', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue('jwt-123');
      const headers = (service as any).getHeaders();
      expect(headers['Authorization']).toBe('Bearer jwt-123');
    });

    it('should return empty headers when no token', () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);
      const headers = (service as any).getHeaders();
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // pinProcess / unpinProcess
  // ═══════════════════════════════════════════════════════════════

  describe('pinProcess and unpinProcess', () => {
    it('should call fetch POST for pinProcess', async () => {
      vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);
      await service.pinProcess(1234);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/processes/extended/1234'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should handle pinProcess error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network Error'));
      await service.pinProcess(999);
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao pinar processo:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should call fetch POST for unpinProcess', async () => {
      vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);
      await service.unpinProcess();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/processes/extended/disable'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should handle unpinProcess error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network Error'));
      await service.unpinProcess();
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao despinhar processo:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // checkAuthenticationAndConnect
  // ═══════════════════════════════════════════════════════════════

  describe('checkAuthenticationAndConnect', () => {
    it('should set isAuthenticated=false on 401 response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response);

      await service.checkAuthenticationAndConnect();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should connect SSE on non-401 error response', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      } as Response);

      await service.checkAuthenticationAndConnect();
      // Deve continuar tentando conectar SSE
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should connect SSE on network error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(global.fetch).mockRejectedValue(new Error('ECONNREFUSED'));

      await service.checkAuthenticationAndConnect();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // login
  // ═══════════════════════════════════════════════════════════════

  describe('login', () => {
    it('should store token and authenticate on successful login', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ access_token: 'new-jwt-token' })
      } as any);

      await service.login('correctpassword', 'admin');

      expect(global.localStorage.setItem).toHaveBeenCalledWith('glances_jwt_token', 'new-jwt-token');
      expect(service.isAuthenticated()).toBe(true);
      expect(service.loginError()).toBeNull();
    });

    it('should set loginError on failed login with detail', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: 'Credenciais inválidas' })
      } as any);

      await service.login('wrongpassword');

      expect(service.loginError()).toBe('Credenciais inválidas');
    });

    it('should set default loginError when no detail in response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.reject(new Error('parse error'))
      } as any);

      await service.login('wrongpassword');

      expect(service.loginError()).toBe('Senha incorreta ou erro de autenticação');
    });

    it('should set connection error on network failure', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network Error'));

      await service.login('anypassword');

      expect(service.loginError()).toBe('Falha na conexão com o servidor');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Default signal values
  // ═══════════════════════════════════════════════════════════════

  describe('default signal values', () => {
    it('should have correct default values for all control signals', () => {
      expect(service.processSortKey()).toBe('cpu_percent');
      expect(service.containerSortKey()).toBe('cpu_percent');
      expect(service.showPerCpu()).toBe(false);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.loginError()).toBeNull();
      expect(service.metrics()).toBeNull();
    });

    it('should expose the full list of 13 plugins', () => {
      expect(service.plugins()).toHaveLength(13);
      expect(service.plugins()).toContain('system');
      expect(service.plugins()).toContain('processes');
    });
  });
});
