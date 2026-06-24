import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (system()) {
      <div class="flex justify-between items-center bg-black py-0.5 px-1 font-mono text-[12px] text-white">
        <div>
          <span class="font-bold text-white">{{ system().hostname }}</span>
          <span class="text-[#888] ml-1">({{ system().system || system().os_name }} {{ system().release || system().os_version }})</span>
          <span class="text-[#888] ml-2">- IP {{ ipAddress() }}{{ publicIp() ? ' Pub ' + publicIp() : '' }}</span>
        </div>
        <div>
          <span class="text-[#888]">Uptime:</span>
          <span class="text-white font-bold ml-1">{{ formatUptimeValue(system().uptime) }}</span>
        </div>
      </div>
    }
  `
})
export class SystemInfoComponent {
  private metricsService = inject(MetricsService);
  readonly system = this.metricsService.system;
  readonly ipAddress = this.metricsService.ipAddress;
  readonly publicIp = this.metricsService.publicIp;

  formatUptimeValue(val: any): string {
    if (typeof val === 'string') {
      return val;
    }
    return this.formatUptime(val);
  }

  formatUptime(seconds: number): string {
    if (seconds === undefined || seconds === null) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs.toString().padStart(1, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  }
}
