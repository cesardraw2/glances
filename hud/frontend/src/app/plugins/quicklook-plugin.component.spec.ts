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

import { QuickLookComponent } from './quicklook-plugin.component';

describe('QuickLookComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      cpu: signal({ total: 45 }),
      mem: signal({ percent: 60, swap_percent: 10 })
    };
  });

  it('should create the component', () => {
    const comp = new QuickLookComponent();
    expect(comp).toBeTruthy();
    expect(comp.cpu().total).toBe(45);
    expect(comp.mem().percent).toBe(60);
  });

  it('should generate ASCII progress bar correctly', () => {
    const comp = new QuickLookComponent();
    // 0% -> tudo vazio '.'
    expect(comp.getAsciiBar(0, 10, 'ok')).toBe('..........');
    
    // 100% -> tudo cheio '|' com tag de cor
    expect(comp.getAsciiBar(100, 10, 'ok')).toBe('<span class="text-green-500 font-bold">||||||||||</span>');
    expect(comp.getAsciiBar(100, 10, 'careful')).toBe('<span class="text-blue-500 font-bold">||||||||||</span>');
    
    // 50% em barra de 10 -> 5 cheios, 5 vazios
    expect(comp.getAsciiBar(50, 10, 'ok')).toBe('<span class="text-green-500 font-bold">|||||</span>.....');
  });
});
