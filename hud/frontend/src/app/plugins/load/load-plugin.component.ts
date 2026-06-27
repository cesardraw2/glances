import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../../services/metrics.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './load-plugin.component.html',
  styleUrl: './load-plugin.component.css'
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
