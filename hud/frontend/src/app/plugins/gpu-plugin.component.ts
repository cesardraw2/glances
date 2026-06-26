import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';
import { PluginCardComponent } from '../core/components/plugin-card/plugin-card.component';

@Component({
  selector: 'app-gpu-plugin',
  standalone: true,
  imports: [CommonModule, PluginCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (gpu() && gpu().length > 0) {
      <app-plugin-card>
        @for (g of gpu(); track g.gpu_id) {
          <div class="flex flex-col">
            <span class="text-white font-bold truncate" [title]="g.name">{{ g.name }}</span>
            <div class="flex space-x-2 text-[#aaa]">
              <span>proc: <strong class="text-white">{{ g.proc !== null && g.proc !== undefined ? g.proc + '%' : 'N/A' }}</strong></span>
              <span>mem: <strong>{{ g.mem !== null && g.mem !== undefined ? g.mem + '%' : 'N/A' }}</strong></span>
            </div>
          </div>
        }
      </app-plugin-card>
    }
  `
})
export class GpuPluginComponent {
  private metricsService = inject(MetricsService);
  readonly gpu = this.metricsService.gpu;
}
