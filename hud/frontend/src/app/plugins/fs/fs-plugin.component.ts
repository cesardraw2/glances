import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../../services/metrics.service';
import { PluginCardComponent } from '../../core/components/plugin-card/plugin-card.component';
import { FormatBytesPipe } from '../../core/pipes/format-bytes.pipe';
import { AlertClassPipe } from '../../core/pipes/alert-class.pipe';

@Component({
  selector: 'app-fs-plugin',
  standalone: true,
  imports: [CommonModule, PluginCardComponent, FormatBytesPipe, AlertClassPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fs-plugin.component.html',
  styleUrl: './fs-plugin.component.css'
})
export class FsPluginComponent {
  private metricsService = inject(MetricsService);
  readonly fs = this.metricsService.fs;
}
