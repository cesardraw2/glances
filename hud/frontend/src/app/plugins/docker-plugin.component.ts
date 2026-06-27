import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MetricsService } from '../services/metrics.service';
import { PluginCardComponent } from '../core/components/plugin-card/plugin-card.component';
import { MeasureRender } from '../core/decorators/aop.decorators';

@Component({
  selector: 'app-docker-plugin',
  standalone: true,
  imports: [CommonModule, PluginCardComponent, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (containers() !== null) {
      @if (formattedContainers(); as conts) {
          <app-plugin-card>
          <!-- Containers header -->
          <div class="text-white font-bold mb-2">
            CONTAINERS {{ conts.length }} sorted by {{ sortKey() === 'cpu_percent' ? 'CPU consumption' : (sortKey() === 'memory_usage' ? 'Memory consumption' : 'Name') }}
          </div>

          <!-- Pinned Container panel -->
          @if (extendedContainer(); as ext) {
            <div class="bg-[#051505] border border-green-900 p-2 mb-3 text-[11px]">
              <div class="flex justify-between items-center mb-1 pb-1 border-b border-green-950">
                <div>
                  <span class="text-green-500 font-bold">Pinned container:</span>
                  <span class="text-white ml-2 font-bold">{{ ext.name }}</span>
                </div>
                <button (click)="unpin()" class="bg-[#111] hover:bg-[#222] border border-red-800 text-red-500 font-bold px-2 py-0.5 text-[10px] cursor-pointer">
                  Unpin
                </button>
              </div>
              <div class="grid grid-cols-12 gap-x-2 text-[#aaa]">
                <div class="col-span-12 sm:col-span-6">
                  <span class="text-white">ID:</span>
                  <span class="text-yellow-500 ml-1">{{ (ext.id || '').substring(0, 12) }}</span>
                  <span class="text-white ml-3">Image:</span>
                  <span class="text-yellow-500 ml-1">{{ ext.image || '-' }}</span>
                </div>
                <div class="col-span-12 sm:col-span-6">
                  <span class="text-white">Command:</span>
                  <span class="text-yellow-500 ml-1">{{ ext._cmdStr }}</span>
                </div>
                <div class="col-span-12 mt-1 border-t border-green-950/40 pt-1">
                  <span class="text-white">Created:</span>
                  <span class="text-green-400 ml-1">{{ ext.created || '-' }}</span>
                  <span class="text-white ml-3">Status:</span>
                  <span class="text-green-400 ml-1">{{ ext.status || '-' }} ({{ ext.uptime || '-' }})</span>
                </div>
              </div>
            </div>
          }

          <!-- Virtual Scroll Layout -->
          <div class="w-full overflow-x-auto font-mono min-w-[1000px]">
            <!-- Header -->
            <div class="flex w-full text-[#888] border-b border-[#111]">
              <div (click)="changeSort('name')" class="pr-2 py-0.5 w-48 shrink-0 font-bold cursor-pointer select-none hover:text-white transition-colors">Name{{ sortKey() === 'name' ? '▼' : '' }}</div>
              <div class="pr-2 py-0.5 w-20 shrink-0 font-bold">Status</div>
              <div class="pr-2 py-0.5 w-24 shrink-0 font-bold">Uptime</div>
              <div (click)="changeSort('cpu_percent')" class="pr-2 py-0.5 text-right w-16 shrink-0 font-bold cursor-pointer select-none hover:text-white transition-colors">CPU%{{ sortKey() === 'cpu_percent' ? '▼' : '' }}</div>
              <div (click)="changeSort('memory_usage')" class="pr-2 py-0.5 text-right w-18 shrink-0 font-bold cursor-pointer select-none hover:text-white transition-colors">MEM{{ sortKey() === 'memory_usage' ? '▼' : '' }}</div>
              <div class="pr-2 py-0.5 text-right w-18 shrink-0 font-bold">MAX</div>
              <div class="pr-2 py-0.5 text-right w-14 shrink-0 font-bold">IORps</div>
              <div class="pr-2 py-0.5 text-right w-14 shrink-0 font-bold">IOWps</div>
              <div class="pr-2 py-0.5 text-right w-14 shrink-0 font-bold">RXps</div>
              <div class="pr-2 py-0.5 text-right w-14 shrink-0 font-bold">TXps</div>
              <div class="pr-2 py-0.5 w-32 shrink-0 font-bold">Ports</div>
              <div class="pl-2 py-0.5 grow font-bold">Command</div>
            </div>

            <!-- Virtual Scroll Body -->
            <cdk-virtual-scroll-viewport itemSize="24" class="w-full h-[300px] overflow-x-hidden">
              <div *cdkVirtualFor="let c of conts; trackBy: trackById"
                   (click)="pin(c.id || c.name)"
                   [ngClass]="pinnedContainerId() === (c.id || c.name) ? 'bg-[#002f00] text-green-300 font-bold border-y border-green-600' : 'even:bg-[#111] hover:bg-[#222]'"
                   class="flex w-full cursor-pointer transition-colors duration-150">
                <div class="pr-2 py-0.5 text-white font-bold truncate w-48 shrink-0" [title]="c.name">{{ c.name }}</div>
                <div class="pr-2 py-0.5 w-20 shrink-0" [class]="c._statusClass">{{ c.status }}</div>
                <div class="pr-2 py-0.5 text-[#aaa] w-24 shrink-0">{{ c.uptime || '-' }}</div>
                <div class="pr-2 py-0.5 text-right font-bold text-green-500 w-16 shrink-0">{{ c._cpuStr }}</div>
                <div class="pr-2 py-0.5 text-right text-[#aaa] w-18 shrink-0">{{ c._memUsageStr }}</div>
                <div class="pr-2 py-0.5 text-right text-[#aaa] w-18 shrink-0">{{ c._memLimitStr }}</div>
                <div class="pr-2 py-0.5 text-right text-[#666] w-14 shrink-0">{{ c._iorStr }}</div>
                <div class="pr-2 py-0.5 text-right text-[#666] w-14 shrink-0">{{ c._iowStr }}</div>
                <div class="pr-2 py-0.5 text-right text-[#666] w-14 shrink-0">{{ c._rxStr }}</div>
                <div class="pr-2 py-0.5 text-right text-[#666] w-14 shrink-0">{{ c._txStr }}</div>
                <div class="pr-2 py-0.5 text-[#aaa] truncate w-32 shrink-0" [title]="c.ports">{{ c.ports || '-' }}</div>
                <div class="pl-2 py-0.5 text-[#aaa] truncate grow" [title]="c._cmdStr">{{ c._cmdStr }}</div>
              </div>
            </cdk-virtual-scroll-viewport>
          </div>
          </app-plugin-card>
      }
    } @else {
      <app-plugin-card>
        <div class="w-full h-[350px] flex items-center justify-center text-[#444] animate-pulse">
          [ INITIALIZING DOCKER MODULE ]
        </div>
      </app-plugin-card>
    }
  `
})
export class DockerPluginComponent {
  private metricsService = inject(MetricsService);
  readonly containers = this.metricsService.containers;
  readonly sortKey = this.metricsService.containerSortKey;
  readonly pinnedContainerId = signal<string | null>(null);

  readonly formattedContainers = computed(() => {
    let conts = this.containers() || [];
    const pinnedId = this.pinnedContainerId();
    if (pinnedId && conts.length > 0) {
      const idx = conts.findIndex((c: any) => (c.id || c.name) === pinnedId);
      if (idx > 0) {
        conts = [conts[idx], ...conts.slice(0, idx), ...conts.slice(idx + 1)];
      }
    }
    return conts;
  });

  readonly extendedContainer = computed(() => {
    const id = this.pinnedContainerId();
    if (!id) return null;
    const all = this.formattedContainers();
    return all.find((c: any) => (c.id || c.name) === id) || null;
  });

  @MeasureRender()
  changeSort(key: string) {
    this.metricsService.containerSortKey.set(key);
  }

  @MeasureRender()
  pin(id: string) {
    if (this.pinnedContainerId() === id) {
      this.pinnedContainerId.set(null);
    } else {
      this.pinnedContainerId.set(id);
    }
  }

  unpin() {
    this.pinnedContainerId.set(null);
  }

  trackById(index: number, item: any): string {
    return item.id || item.name;
  }
}
