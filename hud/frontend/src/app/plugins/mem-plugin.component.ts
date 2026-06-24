import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (mem()) {
      <div class="font-mono text-[12px] text-white leading-relaxed select-none">
        <div class="grid grid-cols-12 gap-x-2">
          <!-- Coluna 1: MEM, total, used, free -->
          <div class="col-span-4 flex flex-col space-y-0.5">
            <div class="flex justify-between">
              <span class="text-[#888] font-bold">MEM</span>
              <span [class]="getAlertClass(mem().percent)">{{ mem().percent }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">total:</span>
              <span>{{ formatBytes(mem().total) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">used:</span>
              <span class="bg-careful text-white px-0.5 font-bold">{{ formatBytes(mem().used) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">free:</span>
              <span>{{ formatBytes(mem().free) }}</span>
            </div>
          </div>

          <!-- Coluna 2: active, inactive, buffers, cached -->
          <div class="col-span-4 flex flex-col space-y-0.5">
            <div class="flex justify-between">
              <span class="text-[#888]">active:</span>
              <span>{{ formatBytes(mem().active) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">inactive:</span>
              <span>{{ formatBytes(mem().inactive) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">buffers:</span>
              <span>{{ formatBytes(mem().buffers) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">cached:</span>
              <span>{{ formatBytes(mem().cached) }}</span>
            </div>
          </div>

          <!-- Coluna 3: SWAP, total, used, free -->
          <div class="col-span-4 flex flex-col space-y-0.5">
            <div class="flex justify-between">
              <span class="text-[#888] font-bold">SWAP</span>
              <span [class]="getAlertClass(mem().swap_percent)">{{ mem().swap_percent }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">total:</span>
              <span>{{ formatBytes(mem().swap_total) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">used:</span>
              <span class="bg-ok text-white px-0.5 font-bold">{{ formatBytes(mem().swap_used) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">free:</span>
              <span>{{ formatBytes(mem().swap_free) }}</span>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class MemPluginComponent {
  private metricsService = inject(MetricsService);
  readonly mem = this.metricsService.mem;

  getAlertClass(percent: number): string {
    if (percent >= 90) return 'critical font-bold';
    if (percent >= 75) return 'warning font-bold';
    return 'ok font-bold';
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'K', 'M', 'G', 'T'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    // Se for GB, exibe como G (ex: 1.9G em vez de 1.94GB, ou 1.3G)
    // Se for MB, exibe como M (ex: 512M)
    const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    const suffix = sizes[i] === 'B' ? 'B' : (sizes[i] === 'K' ? 'K' : (sizes[i] === 'M' ? 'M' : (sizes[i] === 'G' ? 'G' : 'T')));
    return `${val}${suffix}`;
  }
}
