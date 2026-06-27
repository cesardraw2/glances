import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (load()) {
      <div class="font-mono text-[12px] text-white select-none leading-relaxed">
        <div class="text-[#888] font-bold">LOAD <span class="text-[11px] font-normal">{{ load().cpucore || 1 }}-core</span></div>
        <div class="flex flex-col space-y-0.5 mt-1">
          <div class="flex justify-between w-24">
            <span class="text-[#888]">1 min:</span>
            <span [class]="getAlertClass(load().min1)">{{ formatValue(load().min1) }}</span>
          </div>
          <div class="flex justify-between w-24">
            <span class="text-[#888]">5 min:</span>
            <span [class]="getAlertClass(load().min5)">{{ formatValue(load().min5) }}</span>
          </div>
          <div class="flex justify-between w-24">
            <span class="text-[#888]">15 min:</span>
            <span [class]="getAlertClass(load().min15)">{{ formatValue(load().min15) }}</span>
          </div>
        </div>
      </div>
    }
  `
})
export class LoadPluginComponent {
  private metricsService = inject(MetricsService);
  readonly load = this.metricsService.load;

  formatValue(val: number): string {
    return val.toFixed(2).padStart(5, ' ');
  }

  getAlertClass(val: number): string {
    if (val >= 0.9) return 'bg-critical font-bold text-black';
    if (val >= 0.7) return 'bg-warning text-black';
    return 'bg-ok text-black';
  }
}
