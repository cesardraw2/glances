import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../../services/metrics.service';

@Component({
  selector: 'app-sensors-plugin',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sensors-plugin.component.html',
  styleUrl: './sensors-plugin.component.css'
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
