import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (network()) {
      <div class="font-mono text-[12px] text-white leading-relaxed select-none w-full">
        <div class="grid grid-cols-12 gap-x-2 border-b border-[#111] pb-0.5 mb-0.5">
          <span class="text-white font-bold col-span-6">NETWORK</span>
          <span class="text-[#888] col-span-3 text-right">Rx/s</span>
          <span class="text-[#888] col-span-3 text-right">Tx/s</span>
        </div>
        <div class="flex flex-col space-y-0.5">
          @for (net of network(); track net.interface) {
            <div class="grid grid-cols-12 gap-x-2">
              <span class="text-white font-bold col-span-6 truncate" [title]="net.interface">{{ net.interface }}</span>
              <span class="text-[#aaa] col-span-3 text-right">{{ formatRate(net.rx_rate) }}</span>
              <span class="text-[#aaa] col-span-3 text-right">{{ formatRate(net.tx_rate) }}</span>
            </div>
          }
        </div>
        <div class="flex justify-between mt-3 pt-1 border-t border-[#111]">
          <span class="text-[#888]">DefaultGateway</span>
          <span class="text-green-500 font-bold">22ms</span>
        </div>
      </div>
    }
  `
})
export class NetworkPluginComponent {
  private metricsService = inject(MetricsService);
  readonly network = this.metricsService.network;

  formatRate(rate: string): string {
    // Normaliza taxas (ex: '2.0 Mb/s' -> '2Mb')
    return rate.replace(' /s', '').replace(' ', '');
  }
}
