import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../../services/metrics.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './system-info.component.html',
  styleUrl: './system-info.component.css'
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
