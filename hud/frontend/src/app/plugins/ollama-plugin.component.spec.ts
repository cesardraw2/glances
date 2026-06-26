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

import { OllamaPluginComponent } from './ollama-plugin.component';

describe('OllamaPluginComponent', () => {
  beforeEach(() => {
    mockMetricsService = {
      ollama: signal(null),
      formatBytes: (bytes: number) => {
        if (!bytes) return '0 B';
        if (bytes > 1000000000) return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB';
        return bytes + ' B';
      }
    };
  });

  it('should create the component', () => {
    const comp = new OllamaPluginComponent();
    expect(comp).toBeTruthy();
  });

  it('should return empty list when signal is null', () => {
    mockMetricsService.ollama.set(null);
    const comp = new OllamaPluginComponent();
    expect(comp.ollamaList()).toEqual([]);
  });

  it('should return models when signal has data', () => {
    mockMetricsService.ollama.set([
      { name: 'llama3', size: 8000000000, size_vram: 8500000000 }
    ]);
    const comp = new OllamaPluginComponent();
    expect(comp.ollamaList().length).toBe(1);
    expect(comp.ollamaList()[0].name).toBe('llama3');
  });
});
