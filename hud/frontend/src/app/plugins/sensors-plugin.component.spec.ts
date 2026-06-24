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

import { SensorsPluginComponent } from './sensors-plugin.component';

describe('SensorsPluginComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      sensors: signal([
        { label: 'CPU Temp', type: 'temperature', value: 45, unit: 'C', warning: 70, critical: 85 },
        { label: 'Battery', type: 'battery', value: 80, unit: '%', status: 'discharging' }
      ])
    };
  });

  it('should create the component', () => {
    const comp = new SensorsPluginComponent();
    expect(comp).toBeTruthy();
    expect(comp.sensors().length).toBe(2);
  });

  it('should return correct alert class for temperature sensor', () => {
    const comp = new SensorsPluginComponent();
    const tempSensorOk = { type: 'temperature', value: 45, warning: 70, critical: 85 };
    const tempSensorWarning = { type: 'temperature', value: 72, warning: 70, critical: 85 };
    const tempSensorCritical = { type: 'temperature', value: 88, warning: 70, critical: 85 };

    expect(comp.getAlertClass(tempSensorOk)).toBe('ok');
    expect(comp.getAlertClass(tempSensorWarning)).toBe('warning');
    expect(comp.getAlertClass(tempSensorCritical)).toBe('critical');
  });

  it('should return correct alert class for battery sensor', () => {
    const comp = new SensorsPluginComponent();
    const batteryOk = { type: 'battery', value: 80 };
    const batteryWarning = { type: 'battery', value: 25 };
    const batteryCritical = { type: 'battery', value: 10 };

    expect(comp.getAlertClass(batteryOk)).toBe('ok');
    expect(comp.getAlertClass(batteryWarning)).toBe('warning');
    expect(comp.getAlertClass(batteryCritical)).toBe('critical');
  });
});
