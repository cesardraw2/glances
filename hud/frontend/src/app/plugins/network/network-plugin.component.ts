import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../../services/metrics.service';
import { PluginCardComponent } from '../../core/components/plugin-card/plugin-card.component';
import { FormatRatePipe } from '../../core/pipes/format-rate.pipe';

@Component({
  selector: 'app-network-plugin',
  standalone: true,
  imports: [CommonModule, PluginCardComponent, FormatRatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './network-plugin.component.html',
  styleUrl: './network-plugin.component.css'
})
export class NetworkPluginComponent {
  private metricsService = inject(MetricsService);
  readonly network = this.metricsService.network;
}
