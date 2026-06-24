import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';

@Component({
  selector: 'app-sensors-plugin',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (sensors() && sensors().length > 0) {
      <div class="font-mono text-[12px] text-white leading-relaxed select-none w-full">
        <div class="grid grid-cols-12 gap-x-2 border-b border-[#111] pb-0.5 mb-0.5">
          <span class="text-white font-bold col-span-8">SENSORS</span>
          <span class="text-[#888] col-span-4 text-right">Value</span>
        </div>
        <div class="flex flex-col space-y-0.5">
          @for (s of sensors(); track s.label) {
            <div class="grid grid-cols-12 gap-x-2 items-start">
              <span class="text-white font-bold truncate col-span-8" [title]="s.label">{{ s.label }}</span>
              <span [class]="getAlertClass(s) + ' col-span-4 text-right font-bold'">
                {{ s.value }}{{ s.unit }}
                @if (s.type === 'battery') {
                  <span class="text-[9px] text-[#666] block leading-none font-normal">{{ s.status }}</span>
                }
              </span>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class SensorsPluginComponent {
  private metricsService = inject(MetricsService);
  readonly sensors = this.metricsService.sensors;

  getAlertClass(s: any): string {
    if (s.type === 'battery') {
      if (s.value <= 15) return 'critical';
      if (s.value <= 30) return 'warning';
      return 'ok';
    }
    // Temperatura
    if (s.critical && s.value >= s.critical) return 'critical';
    if (s.warning && s.value >= s.warning) return 'warning';
    return 'ok';
  }
}
