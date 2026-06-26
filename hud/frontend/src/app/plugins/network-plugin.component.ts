import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';
import { PluginCardComponent } from '../core/components/plugin-card/plugin-card.component';
import { FormatRatePipe } from '../core/pipes/format-rate.pipe';

@Component({
  selector: 'app-network-plugin',
  standalone: true,
  imports: [CommonModule, PluginCardComponent, FormatRatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (network()) {
      <app-plugin-card>
        <div class="grid grid-cols-12 gap-x-2 border-b border-[#111] pb-0.5 mb-0.5">
          <span class="text-white font-bold col-span-6">NETWORK</span>
          <span class="text-[#888] col-span-3 text-right">Rx/s</span>
          <span class="text-[#888] col-span-3 text-right">Tx/s</span>
        </div>
        <div class="flex flex-col space-y-0.5">
          @for (net of network(); track net.interface) {
            <div class="grid grid-cols-12 gap-x-2">
              <span class="text-white font-bold col-span-6 truncate" [title]="net.interface">{{ net.interface }}</span>
              <span class="text-[#aaa] col-span-3 text-right">{{ net.rx_rate | formatRate }}</span>
              <span class="text-[#aaa] col-span-3 text-right">{{ net.tx_rate | formatRate }}</span>
            </div>
          }
        </div>
        <div class="flex justify-between mt-3 pt-1 border-t border-[#111]">
          <span class="text-[#888]">DefaultGateway</span>
          <span class="text-green-500 font-bold">22ms</span>
        </div>
      </app-plugin-card>
    }
  `
})
export class NetworkPluginComponent {
  private metricsService = inject(MetricsService);
  readonly network = this.metricsService.network;
}
