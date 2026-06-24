import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (fs()) {
      <div class="font-mono text-[12px] text-white leading-relaxed select-none w-full">
        <div class="grid grid-cols-12 gap-x-2 border-b border-[#111] pb-0.5 mb-0.5">
          <span class="text-white font-bold col-span-6">FILE SYS</span>
          <span class="text-[#888] col-span-3 text-right">Used</span>
          <span class="text-[#888] col-span-3 text-right">Total</span>
        </div>
        <div class="flex flex-col space-y-0.5">
          @for (item of fs(); track item.device) {
            <div class="grid grid-cols-12 gap-x-2 items-start">
              <div class="flex flex-col col-span-6 min-w-0">
                <span class="text-white font-bold truncate" [title]="item.mount">{{ item.mount }}</span>
                <span class="text-[#666] text-[10px] truncate" [title]="item.device">{{ item.device }}</span>
              </div>
              <span [class]="getAlertClass(item.percent) + ' col-span-3 text-right font-bold'">
                {{ formatBytes(item.used) }}
              </span>
              <span class="text-[#aaa] col-span-3 text-right">{{ formatBytes(item.size) }}</span>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class FsPluginComponent {
  private metricsService = inject(MetricsService);
  readonly fs = this.metricsService.fs;

  getAlertClass(percent: number): string {
    if (percent >= 90) return 'critical';
    if (percent >= 75) return 'warning';
    return 'ok';
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'K', 'M', 'G', 'T'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${val}${sizes[i]}`;
  }
}
