import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../../services/metrics.service';
import { PluginCardComponent } from '../../core/components/plugin-card/plugin-card.component';
import { FormatRatePipe } from '../../core/pipes/format-rate.pipe';

@Component({
  selector: 'app-diskio-plugin',
  standalone: true,
  imports: [CommonModule, PluginCardComponent, FormatRatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './diskio-plugin.component.html',
  styleUrl: './diskio-plugin.component.css'
})
export class DiskIoPluginComponent {
  private metricsService = inject(MetricsService);
  readonly diskio = this.metricsService.diskio;
}
