import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../../services/metrics.service';
import { PluginCardComponent } from '../../core/components/plugin-card/plugin-card.component';
import { AlertClassPipe } from '../../core/pipes/alert-class.pipe';

@Component({
  selector: 'app-cpu-plugin',
  standalone: true,
  imports: [CommonModule, AlertClassPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cpu-plugin.component.html',
  styleUrl: './cpu-plugin.component.css'
})
export class CpuPluginComponent {
  private metricsService = inject(MetricsService);
  readonly cpu = this.metricsService.cpu;
  readonly showPerCpu = this.metricsService.showPerCpu;
}
