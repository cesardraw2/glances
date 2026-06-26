import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';
import { PluginCardComponent } from '../core/components/plugin-card/plugin-card.component';
import { FormatBytesPipe } from '../core/pipes/format-bytes.pipe';
import { FormatRatePipe } from '../core/pipes/format-rate.pipe';
import { MeasureRender } from '../core/decorators/aop.decorators';

@Component({
  selector: 'app-docker-plugin',
  standalone: true,
  imports: [CommonModule, PluginCardComponent, FormatBytesPipe, FormatRatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (containers() && containers().length > 0) {
      <app-plugin-card>
        <!-- Containers header -->
        <div class="text-white font-bold mb-2">
          CONTAINERS {{ containers().length }} sorted by {{ sortKey() === 'cpu_percent' ? 'CPU consumption' : (sortKey() === 'memory_usage' ? 'Memory consumption' : 'Name') }}
        </div>

        <!-- Table -->
        <div class="w-full overflow-x-auto font-mono">
          <table class="w-full text-left font-mono">
            <thead>
              <tr class="text-[#888] border-b border-[#111]">
                <th (click)="changeSort('name')" class="pr-2 py-0.5 align-middle w-48 font-bold cursor-pointer select-none hover:text-white transition-colors">
                  Name{{ sortKey() === 'name' ? '▼' : '' }}
                </th>
                <th class="pr-2 py-0.5 align-middle w-20 font-bold">Status</th>
                <th class="pr-2 py-0.5 align-middle w-24 font-bold">Uptime</th>
                <th (click)="changeSort('cpu_percent')" class="pr-2 py-0.5 align-middle text-right w-16 font-bold cursor-pointer select-none hover:text-white transition-colors">
                  CPU%{{ sortKey() === 'cpu_percent' ? '▼' : '' }}
                </th>
                <th (click)="changeSort('memory_usage')" class="pr-2 py-0.5 align-middle text-right w-18 font-bold cursor-pointer select-none hover:text-white transition-colors">
                  MEM{{ sortKey() === 'memory_usage' ? '▼' : '' }}
                </th>
                <th class="pr-2 py-0.5 align-middle text-right w-18 font-bold">MAX</th>
                <th class="pr-2 py-0.5 align-middle text-right w-14 font-bold">IORps</th>
                <th class="pr-2 py-0.5 align-middle text-right w-14 font-bold">IOWps</th>
                <th class="pr-2 py-0.5 align-middle text-right w-14 font-bold">RXps</th>
                <th class="pr-2 py-0.5 align-middle text-right w-14 font-bold">TXps</th>
                <th class="pr-2 py-0.5 align-middle w-32 font-bold">Ports</th>
                <th class="pl-2 py-0.5 align-middle font-bold">Command</th>
              </tr>
            </thead>
            <tbody>
              @for (c of containers(); track c.id || c.name) {
                <tr (click)="toggleHighlight(c.id || c.name)"
                    [ngClass]="highlightedContainerId() === (c.id || c.name) ? 'bg-[#002f00] text-green-300 font-bold border-y border-green-600' : 'even:bg-[#111] hover:bg-[#222]'"
                    class="cursor-pointer transition-colors duration-150">
                  <td class="pr-2 py-0.5 align-middle text-white font-bold truncate max-w-[190px]" [title]="c.name">{{ c.name }}</td>
                  <td class="pr-2 py-0.5 align-middle" [class]="getStatusClass(c.status)">{{ c.status }}</td>
                  <td class="pr-2 py-0.5 align-middle text-[#aaa]">{{ c.uptime || '-' }}</td>
                  <td class="pr-2 py-0.5 align-middle text-right font-bold text-green-500">{{ (c.cpu_percent || 0).toFixed(1) }}%</td>
                  <td class="pr-2 py-0.5 align-middle text-right text-[#aaa]">{{ (c.memory_usage || c.memory?.usage || 0) | formatBytes }}</td>
                  <td class="pr-2 py-0.5 align-middle text-right text-[#aaa]">{{ (c.memory_limit || c.memory?.limit || 0) | formatBytes }}</td>
                  <td class="pr-2 py-0.5 align-middle text-right text-[#666]">{{ c.io?.ior | formatRate }}</td>
                  <td class="pr-2 py-0.5 align-middle text-right text-[#666]">{{ c.io?.iow | formatRate }}</td>
                  <td class="pr-2 py-0.5 align-middle text-right text-[#666]">{{ c.network?.rx | formatRate }}</td>
                  <td class="pr-2 py-0.5 align-middle text-right text-[#666]">{{ c.network?.tx | formatRate }}</td>
                  <td class="pr-2 py-0.5 align-middle text-[#aaa] truncate max-w-[120px]" [title]="c.ports">{{ c.ports || '-' }}</td>
                  <td class="pl-2 py-0.5 align-middle text-[#aaa] truncate max-w-[200px]" [title]="getCommandStr(c.command)">{{ getCommandStr(c.command) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-plugin-card>
    }
  `
})
export class DockerPluginComponent {
  private metricsService = inject(MetricsService);
  readonly containers = this.metricsService.containers;
  readonly sortKey = this.metricsService.containerSortKey;
  readonly highlightedContainerId = signal<string | null>(null);

  @MeasureRender()
  changeSort(key: string) {
    this.metricsService.containerSortKey.set(key);
  }

  @MeasureRender()
  toggleHighlight(id: string) {
    if (this.highlightedContainerId() === id) {
      this.highlightedContainerId.set(null);
    } else {
      this.highlightedContainerId.set(id);
    }
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'healthy' || s === 'running' || s === 'up') return 'text-green-500 font-bold';
    if (s === 'unhealthy' || s === 'dead' || s === 'exited') return 'text-red-500 font-bold';
    return 'text-yellow-500 font-bold';
  }

  getCommandStr(cmd: any): string {
    if (!cmd) return '-';
    if (Array.isArray(cmd)) return cmd.join(' ');
    return cmd;
  }
}
