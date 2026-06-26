import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';
import { PluginCardComponent } from '../core/components/plugin-card/plugin-card.component';
import { FormatBytesPipe } from '../core/pipes/format-bytes.pipe';
import { AlertClassPipe } from '../core/pipes/alert-class.pipe';

@Component({
  selector: 'app-mem-plugin',
  standalone: true,
  imports: [CommonModule, FormatBytesPipe, AlertClassPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (mem()) {
      <div class="font-mono text-[12px] text-white leading-relaxed select-none w-full ">
        <div class="grid grid-cols-12 gap-x-2">
          <!-- Coluna 1: MEM, total, used, free -->
          <div class="col-span-4 flex flex-col space-y-0.5">
            <div class="flex justify-between">
              <span class="text-[#888] font-bold">MEM</span>
              <span [class]="mem().percent | alertClass">{{ mem().percent }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">total:</span>
              <span>{{ mem().total | formatBytes }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">used:</span>
              <span class="bg-careful text-white px-0.5 font-bold">{{ mem().used | formatBytes }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">free:</span>
              <span>{{ mem().free | formatBytes }}</span>
            </div>
          </div>

          <!-- Coluna 2: active, inactive, buffers, cached -->
          <div class="col-span-4 flex flex-col space-y-0.5">
            <div class="flex justify-between">
              <span class="text-[#888]">active:</span>
              <span>{{ mem().active | formatBytes }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">inactive:</span>
              <span>{{ mem().inactive | formatBytes }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">buffers:</span>
              <span>{{ mem().buffers | formatBytes }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">cached:</span>
              <span>{{ mem().cached | formatBytes }}</span>
            </div>
          </div>

          <!-- Coluna 3: SWAP, total, used, free -->
          <div class="col-span-4 flex flex-col space-y-0.5">
            <div class="flex justify-between">
              <span class="text-[#888] font-bold">SWAP</span>
              <span [class]="mem().swap_percent | alertClass">{{ mem().swap_percent }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">total:</span>
              <span>{{ mem().swap_total | formatBytes }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">used:</span>
              <span class="bg-ok text-white px-0.5 font-bold">{{ mem().swap_used | formatBytes }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">free:</span>
              <span>{{ mem().swap_free | formatBytes }}</span>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class MemPluginComponent {
  private metricsService = inject(MetricsService);
  readonly mem = this.metricsService.mem;
}
