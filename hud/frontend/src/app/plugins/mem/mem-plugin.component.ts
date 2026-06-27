import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../../services/metrics.service';
import { PluginCardComponent } from '../../core/components/plugin-card/plugin-card.component';
import { FormatBytesPipe } from '../../core/pipes/format-bytes.pipe';
import { AlertClassPipe } from '../../core/pipes/alert-class.pipe';

@Component({
  selector: 'app-mem-plugin',
  standalone: true,
  imports: [CommonModule, FormatBytesPipe, AlertClassPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mem-plugin.component.html',
  styleUrl: './mem-plugin.component.css'
})
export class MemPluginComponent {
  private metricsService = inject(MetricsService);
  readonly mem = this.metricsService.mem;
}
