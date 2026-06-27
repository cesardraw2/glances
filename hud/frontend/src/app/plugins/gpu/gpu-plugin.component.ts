import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../../services/metrics.service';
import { PluginCardComponent } from '../../core/components/plugin-card/plugin-card.component';

@Component({
  selector: 'app-gpu-plugin',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gpu-plugin.component.html',
  styleUrl: './gpu-plugin.component.css'
})
export class GpuPluginComponent {
  private metricsService = inject(MetricsService);
  readonly gpu = this.metricsService.gpu;
}
