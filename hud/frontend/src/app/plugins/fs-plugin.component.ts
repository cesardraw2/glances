import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';
import { PluginCardComponent } from '../core/components/plugin-card/plugin-card.component';
import { FormatBytesPipe } from '../core/pipes/format-bytes.pipe';
import { AlertClassPipe } from '../core/pipes/alert-class.pipe';

@Component({
  selector: 'app-fs-plugin',
  standalone: true,
  imports: [CommonModule, PluginCardComponent, FormatBytesPipe, AlertClassPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (fs()) {
      <app-plugin-card>
        <div class="grid grid-cols-12 gap-x-2 border-b border-[#111] pb-0.5 mb-0.5">
          <span class="text-white font-bold col-span-6">FILE SYS</span>
          <span class="text-[#888] col-span-3 text-right">Used</span>
          <span class="text-[#888] col-span-3 text-right">Total</span>
        </div>
        <div class="flex flex-col space-y-0.5">
          @for (item of fs(); track item.device) {
            <div class="grid grid-cols-12 gap-x-2 items-start">
              <div class="flex flex-col col-span-6 min-w-0">
                <span class="text-white font-bold truncate" [title]="item.mount">{{ item.mount }}</span>
                <span class="text-[#666] text-[10px] truncate" [title]="item.device">{{ item.device }}</span>
              </div>
              <span [class]="(item.percent | alertClass) + ' col-span-3 text-right font-bold'">
                {{ item.used | formatBytes }}
              </span>
              <span class="text-[#aaa] col-span-3 text-right">{{ item.size | formatBytes }}</span>
            </div>
          }
        </div>
      </app-plugin-card>
    }
  `
})
export class FsPluginComponent {
  private metricsService = inject(MetricsService);
  readonly fs = this.metricsService.fs;
}
