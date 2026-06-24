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
  let app: AppComponent;

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
    app = new AppComponent();
  });

  // ─── Criação e Propriedades Básicas ──────────────────────────

  it('should create the app and expose service signals', () => {
    expect(app).toBeTruthy();
    expect(app.isConnected()).toBe(true);
    expect(app.isAuthenticated()).toBe(true);
    expect(app.loginError()).toBeNull();
    expect(app.activePlugins().length).toBe(12);
    expect(app.version()).toBe('v4.0.0-mock');
  });

  // ─── onLogin ─────────────────────────────────────────────────

  it('should delegate onLogin to metricsService.login', () => {
    app.onLogin('admin', 'secret123');
    expect(mockMetricsService.login).toHaveBeenCalledWith('secret123', 'admin');
  });

  // ─── Computed: hasGpu ────────────────────────────────────────

  it('should return false for hasGpu when GPU list is empty', () => {
    expect(app.hasGpu()).toBe(false);
  });

  it('should return true for hasGpu when GPU list has entries', () => {
    mockMetricsService.gpu.set([{ name: 'GTX 1080', mem: 50 }]);
    expect(app.hasGpu()).toBe(true);
  });

  it('should return falsy for hasGpu when GPU list is null', () => {
    mockMetricsService.gpu.set(null);
    expect(app.hasGpu()).toBeFalsy();
  });

  // ─── Computed: cpuColClass / memColClass ─────────────────────

  it('should return 4-col class when GPU is not visible', () => {
    expect(app.cpuColClass()).toBe('col-span-12 md:col-span-4');
    expect(app.memColClass()).toBe('col-span-12 md:col-span-4');
  });

  it('should return 3-col class when GPU is visible and exists', () => {
    mockMetricsService.gpu.set([{ name: 'RTX 3090' }]);
    expect(app.showGpu()).toBe(true);
    expect(app.cpuColClass()).toBe('col-span-12 md:col-span-3');
    expect(app.memColClass()).toBe('col-span-12 md:col-span-3');
  });

  it('should return 4-col class when GPU exists but visibility is off', () => {
    mockMetricsService.gpu.set([{ name: 'RTX 3090' }]);
    app.showGpu.set(false);
    expect(app.cpuColClass()).toBe('col-span-12 md:col-span-4');
    expect(app.memColClass()).toBe('col-span-12 md:col-span-4');
  });

  // ─── Computed: activeAlert ──────────────────────────────────

  it('should return null when no alerts', () => {
    expect(app.activeAlert()).toBeNull();
  });

  it('should return the most recent alert', () => {
    mockMetricsService.alerts.set([
      { msg: 'CPU HIGH', severity: 'warning' },
      { msg: 'DISK FULL', severity: 'critical' }
    ]);
    expect(app.activeAlert()).toEqual({ msg: 'DISK FULL', severity: 'critical' });
  });

  // ─── Keyboard Shortcuts: Visibility Toggles ─────────────────

  const makeKeyEvent = (key: string, tagName = 'DIV') =>
    ({ target: { tagName }, key } as any);

  it('should ignore keydowns on INPUT and TEXTAREA elements', () => {
    app.handleKeyDown(makeKeyEvent('D', 'INPUT'));
    expect(app.showDocker()).toBe(true); // Unchanged

    app.handleKeyDown(makeKeyEvent('g', 'TEXTAREA'));
    expect(app.showGpu()).toBe(true); // Unchanged
  });

  it('should toggle showDocker on "D" (uppercase)', () => {
    expect(app.showDocker()).toBe(true);
    app.handleKeyDown(makeKeyEvent('D'));
    expect(app.showDocker()).toBe(false);
    app.handleKeyDown(makeKeyEvent('D'));
    expect(app.showDocker()).toBe(true);
  });

  it('should toggle showGpu on "g"', () => {
    expect(app.showGpu()).toBe(true);
    app.handleKeyDown(makeKeyEvent('g'));
    expect(app.showGpu()).toBe(false);
  });

  it('should toggle showSidebar on "2"', () => {
    expect(app.showSidebar()).toBe(true);
    app.handleKeyDown(makeKeyEvent('2'));
    expect(app.showSidebar()).toBe(false);
  });

  it('should toggle showNetwork on "n"', () => {
    expect(app.showNetwork()).toBe(true);
    app.handleKeyDown(makeKeyEvent('n'));
    expect(app.showNetwork()).toBe(false);
  });

  it('should toggle showDiskIo on "d" (lowercase)', () => {
    expect(app.showDiskIo()).toBe(true);
    app.handleKeyDown(makeKeyEvent('d'));
    expect(app.showDiskIo()).toBe(false);
  });

  it('should toggle showFileSystem on "f"', () => {
    expect(app.showFileSystem()).toBe(true);
    app.handleKeyDown(makeKeyEvent('f'));
    expect(app.showFileSystem()).toBe(false);
  });

  it('should toggle showSensors on "s"', () => {
    expect(app.showSensors()).toBe(true);
    app.handleKeyDown(makeKeyEvent('s'));
    expect(app.showSensors()).toBe(false);
  });

  it('should toggle showQuickLook on "3"', () => {
    expect(app.showQuickLook()).toBe(true);
    app.handleKeyDown(makeKeyEvent('3'));
    expect(app.showQuickLook()).toBe(false);
  });

  it('should toggle showTopMenu on "5"', () => {
    expect(app.showTopMenu()).toBe(true);
    app.handleKeyDown(makeKeyEvent('5'));
    expect(app.showTopMenu()).toBe(false);
  });

  it('should toggle showPerCpu on "1"', () => {
    expect(mockMetricsService.showPerCpu()).toBe(false);
    app.handleKeyDown(makeKeyEvent('1'));
    expect(mockMetricsService.showPerCpu()).toBe(true);
  });

  // ─── Keyboard Shortcuts: Process Sort Keys ──────────────────

  it('should set processSortKey to cpu_percent on "a" or "c"', () => {
    mockMetricsService.processSortKey.set('name');
    app.handleKeyDown(makeKeyEvent('a'));
    expect(mockMetricsService.processSortKey()).toBe('cpu_percent');

    mockMetricsService.processSortKey.set('name');
    app.handleKeyDown(makeKeyEvent('c'));
    expect(mockMetricsService.processSortKey()).toBe('cpu_percent');
  });

  it('should set processSortKey to mem_percent on "m"', () => {
    app.handleKeyDown(makeKeyEvent('m'));
    expect(mockMetricsService.processSortKey()).toBe('mem_percent');
  });

  it('should set processSortKey to name on "p"', () => {
    app.handleKeyDown(makeKeyEvent('p'));
    expect(mockMetricsService.processSortKey()).toBe('name');
  });

  it('should set processSortKey to username on "u"', () => {
    app.handleKeyDown(makeKeyEvent('u'));
    expect(mockMetricsService.processSortKey()).toBe('username');
  });

  it('should set processSortKey to time on "t"', () => {
    app.handleKeyDown(makeKeyEvent('t'));
    expect(mockMetricsService.processSortKey()).toBe('time');
  });

  it('should set processSortKey to io on "i"', () => {
    app.handleKeyDown(makeKeyEvent('i'));
    expect(mockMetricsService.processSortKey()).toBe('io');
  });

  // ─── Component Registry ─────────────────────────────────────

  it('should have all 12 plugins in the component registry', () => {
    const keys = Object.keys(app.componentRegistry);
    expect(keys).toContain('system');
    expect(keys).toContain('quicklook');
    expect(keys).toContain('load');
    expect(keys).toContain('cpu');
    expect(keys).toContain('mem');
    expect(keys).toContain('network');
    expect(keys).toContain('diskio');
    expect(keys).toContain('fs');
    expect(keys).toContain('docker');
    expect(keys).toContain('gpu');
    expect(keys).toContain('sensors');
    expect(keys).toContain('processes');
    expect(keys.length).toBe(12);
  });

  // ─── Computed: topPlugins ────────────────────────────────────

  it('should include only system in topPlugins', () => {
    const top = app.topPlugins();
    expect(top.length).toBe(1);
    expect(top[0].name).toBe('system');
  });

  // ─── Computed: subTopPlugins ─────────────────────────────────

  it('should include quicklook, cpu, mem, load in subTopPlugins', () => {
    const sub = app.subTopPlugins();
    const names = sub.map((p: any) => p.name);
    expect(names).toContain('quicklook');
    expect(names).toContain('cpu');
    expect(names).toContain('mem');
    expect(names).toContain('load');
    expect(sub.length).toBe(4);
  });

  // ─── Computed: sidebarPlugins ────────────────────────────────

  it('should include network, diskio, fs, sensors in sidebarPlugins when all visible', () => {
    const sidebar = app.sidebarPlugins();
    const names = sidebar.map((p: any) => p.name);
    expect(names).toContain('network');
    expect(names).toContain('diskio');
    expect(names).toContain('fs');
    expect(names).toContain('sensors');
    expect(sidebar.length).toBe(4);
  });

  it('should exclude hidden sidebar plugins', () => {
    app.showNetwork.set(false);
    app.showDiskIo.set(false);
    const sidebar = app.sidebarPlugins();
    const names = sidebar.map((p: any) => p.name);
    expect(names).not.toContain('network');
    expect(names).not.toContain('diskio');
    expect(names).toContain('fs');
    expect(names).toContain('sensors');
    expect(sidebar.length).toBe(2);
  });

  // ─── Computed: mainPlugins ───────────────────────────────────

  it('should include docker and processes in mainPlugins when docker is visible', () => {
    const main = app.mainPlugins();
    const names = main.map((p: any) => p.name);
    expect(names).toContain('docker');
    expect(names).toContain('processes');
    expect(main.length).toBe(2);
  });

  it('should exclude docker from mainPlugins when hidden', () => {
    app.showDocker.set(false);
    const main = app.mainPlugins();
    const names = main.map((p: any) => p.name);
    expect(names).not.toContain('docker');
    expect(names).toContain('processes');
    expect(main.length).toBe(1);
  });

  // ─── Visibility Signals Default State ────────────────────────

  it('should have all visibility signals default to true', () => {
    expect(app.showSidebar()).toBe(true);
    expect(app.showNetwork()).toBe(true);
    expect(app.showDiskIo()).toBe(true);
    expect(app.showFileSystem()).toBe(true);
    expect(app.showDocker()).toBe(true);
    expect(app.showGpu()).toBe(true);
    expect(app.showQuickLook()).toBe(true);
    expect(app.showTopMenu()).toBe(true);
    expect(app.showSensors()).toBe(true);
  });
});
