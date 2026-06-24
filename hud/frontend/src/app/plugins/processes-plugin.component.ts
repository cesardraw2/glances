import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (processes(); as procs) {
      <div class="font-mono text-[12px] text-[#ccc] leading-relaxed select-none w-full">
        <!-- Tasks header -->
        <div class="text-white font-bold mb-2">
          TASKS {{ processcount()?.total || procs.length }} ({{ processcount()?.thread || 0 }} thr), {{ processcount()?.running || 0 }} run, {{ processcount()?.sleeping || 0 }} slp sorted by {{ sortKey() }}, flat view
        </div>

        <!-- Pinned task panel -->
        @if (extendedProcess(); as ext) {
          <div class="bg-[#051505] border border-green-900 p-2 mb-3 text-[11px]">
            <div class="flex justify-between items-center mb-1 pb-1 border-b border-green-950">
              <div>
                <span class="text-green-500 font-bold">Pinned task:</span>
                <span class="text-white ml-2 font-bold">{{ ext.cmdline || ext.name }}</span>
              </div>
              <button (click)="unpin()" class="bg-[#111] hover:bg-[#222] border border-red-800 text-red-500 font-bold px-2 py-0.5 text-[10px] cursor-pointer">
                Unpin
              </button>
            </div>
            <div class="grid grid-cols-12 gap-x-2 text-[#aaa]">
              <div class="col-span-12 sm:col-span-6">
                <span class="text-white">CPU Min/Max/Mean:</span>
                <span class="text-yellow-500 ml-1">
                  {{ ext.cpu_min !== undefined ? ext.cpu_min.toFixed(1) + '%' : '-' }} / 
                  {{ ext.cpu_max !== undefined ? ext.cpu_max.toFixed(1) + '%' : '-' }} / 
                  {{ ext.cpu_mean !== undefined ? ext.cpu_mean.toFixed(1) + '%' : '-' }}
                </span>
                <span class="text-white ml-3">Affinity:</span>
                <span class="text-yellow-500 ml-1">{{ ext.cpu_affinity ? ext.cpu_affinity.length : '-' }}</span>
              </div>
              <div class="col-span-12 sm:col-span-6">
                <span class="text-white">MEM Min/Max/Mean:</span>
                <span class="text-yellow-500 ml-1">
                  {{ ext.memory_min !== undefined ? ext.memory_min.toFixed(1) + '%' : '-' }} / 
                  {{ ext.memory_max !== undefined ? ext.memory_max.toFixed(1) + '%' : '-' }} / 
                  {{ ext.memory_mean !== undefined ? ext.memory_mean.toFixed(1) + '%' : '-' }}
                </span>
              </div>
              <div class="col-span-12 mt-1 border-t border-green-950/40 pt-1">
                <span class="text-white">Memory info:</span>
                <span class="text-green-400 ml-1 text-[10px] break-all">
                  rss: {{ ext.memory_info?.rss || '-' }} / 
                  vms: {{ ext.memory_info?.vms || '-' }} / 
                  shared: {{ ext.memory_info?.shared || '-' }} / 
                  text: {{ ext.memory_info?.text || '-' }} / 
                  lib: {{ ext.memory_info?.lib || '-' }} / 
                  data: {{ ext.memory_info?.data || '-' }} / 
                  dirty: {{ ext.memory_info?.dirty || '-' }}
                </span>
              </div>
            </div>
          </div>
        }
        
        <!-- Table -->
        <div class="w-full overflow-x-auto font-mono">
          <table class="w-full text-left font-mono">
            <thead>
              <tr class="text-[#888] border-b border-[#111]">
                <th (click)="changeSort('cpu_percent')" class="pr-2 py-0.5 align-middle text-right w-12 font-bold cursor-pointer select-none hover:text-white transition-colors">
                  CPU%{{ sortKey() === 'cpu_percent' ? '▼' : '' }}
                </th>
                <th (click)="changeSort('mem_percent')" class="pr-2 py-0.5 align-middle text-right w-12 font-bold cursor-pointer select-none hover:text-white transition-colors">
                  MEM%{{ sortKey() === 'mem_percent' ? '▼' : '' }}
                </th>
                <th class="pr-2 py-0.5 align-middle text-right w-16 font-bold">VIRT</th>
                <th class="pr-2 py-0.5 align-middle text-right w-16 font-bold">RES</th>
                <th class="pr-2 py-0.5 align-middle text-right w-14 font-bold">PID</th>
                <th (click)="changeSort('username')" class="pr-2 py-0.5 align-middle w-16 font-bold cursor-pointer select-none hover:text-white transition-colors">
                  USER{{ sortKey() === 'username' ? '▼' : '' }}
                </th>
                <th (click)="changeSort('time')" class="pr-2 py-0.5 align-middle text-right w-20 font-bold cursor-pointer select-none hover:text-white transition-colors">
                  TIME+{{ sortKey() === 'time' ? '▼' : '' }}
                </th>
                <th class="pr-2 py-0.5 align-middle text-right w-10 font-bold">THR</th>
                <th class="pr-2 py-0.5 align-middle text-right w-8 font-bold">NI</th>
                <th class="pr-2 py-0.5 align-middle text-center w-6 font-bold">S</th>
                <th (click)="changeSort('io')" class="pr-2 py-0.5 align-middle text-right w-12 font-bold cursor-pointer select-none hover:text-white transition-colors">
                  IOR/s{{ sortKey() === 'io' ? '▼' : '' }}
                </th>
                <th (click)="changeSort('io')" class="pr-2 py-0.5 align-middle text-right w-12 font-bold cursor-pointer select-none hover:text-white transition-colors">
                  IOW/s{{ sortKey() === 'io' ? '▼' : '' }}
                </th>
                <th (click)="changeSort('name')" class="pl-2 py-0.5 align-middle font-bold cursor-pointer select-none hover:text-white transition-colors">
                  Command (click to pin){{ sortKey() === 'name' ? '▼' : '' }}
                </th>
              </tr>
            </thead>
            <tbody>
              @for (proc of procs; track proc.pid) {
                <tr (click)="pin(proc.pid)" 
                    [ngClass]="extendedProcess()?.pid === proc.pid ? 'bg-[#002f00] text-green-300 font-bold border-y border-green-600' : 'even:bg-[#111] hover:bg-[#222]'"
                    class="cursor-pointer transition-colors duration-150">
                  <td class="pr-2 py-0.5 align-middle text-right font-bold" [class]="cpuClass(proc.cpu_percent)">
                    {{ proc.cpu_percent.toFixed(1) }}
                  </td>
                  <td class="pr-2 py-0.5 align-middle text-right text-green-500">
                    {{ (proc.mem_percent !== undefined ? proc.mem_percent : (proc.memory_percent !== undefined ? proc.memory_percent : 0)).toFixed(1) }}
                  </td>
                  <td class="pr-2 py-0.5 align-middle text-right text-[#aaa]">{{ getVirt(proc) }}</td>
                  <td class="pr-2 py-0.5 align-middle text-right text-[#aaa]">{{ getRes(proc) }}</td>
                  <td class="pr-2 py-0.5 align-middle text-right text-white">{{ proc.pid }}</td>
                  <td class="pr-2 py-0.5 align-middle text-[#aaa] truncate max-w-[70px]">{{ proc.username }}</td>
                  <td class="pr-2 py-0.5 align-middle text-right text-[#aaa]">{{ formatProcessTime(proc.cpu_times) }}</td>
                  <td class="pr-2 py-0.5 align-middle text-right text-[#aaa]">{{ proc.num_threads !== undefined ? proc.num_threads : 0 }}</td>
                  <td class="pr-2 py-0.5 align-middle text-right text-[#aaa]">{{ proc.nice !== undefined ? proc.nice : 0 }}</td>
                  <td class="pr-2 py-0.5 align-middle text-center" [class]="isProcessRunning(proc) ? 'text-green-500 font-bold' : 'text-[#666]'">
                    {{ getProcessStatus(proc) }}
                  </td>
                  <td class="pr-2 py-0.5 align-middle text-right text-[#666]">0</td>
                  <td class="pr-2 py-0.5 align-middle text-right text-[#666]">0</td>
                  <td class="pl-2 py-0.5 align-middle text-white font-bold truncate max-w-[150px] md:max-w-[300px]">
                    {{ proc.name }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `
})
export class ProcessesPluginComponent {
  private metricsService = inject(MetricsService);
  readonly processes = this.metricsService.processes;
  readonly processcount = this.metricsService.processcount;
  readonly sortKey = this.metricsService.processSortKey;
  readonly extendedProcess = this.metricsService.extendedProcess;

  changeSort(key: string) {
    this.metricsService.processSortKey.set(key);
  }

  pin(pid: number) {
    if (this.extendedProcess()?.pid === pid) {
      this.unpin();
    } else {
      this.metricsService.pinProcess(pid);
    }
  }

  unpin() {
    this.metricsService.unpinProcess();
  }

  cpuClass(cpu: number): string {
    if (cpu >= 80) return 'critical';
    if (cpu >= 50) return 'warning';
    return 'ok';
  }

  formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'K', 'M', 'G', 'T'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${val}${sizes[i]}`;
  }

  getVirt(proc: any): string {
    if (proc.memory_info?.vms !== undefined) {
      return this.formatBytes(proc.memory_info.vms);
    }
    return this.getMockVirt(proc.name);
  }

  getRes(proc: any): string {
    if (proc.memory_info?.rss !== undefined) {
      return this.formatBytes(proc.memory_info.rss);
    }
    return this.getMockRes(proc.name);
  }

  getMockVirt(name: string): string {
    if (name.includes('chrome') || name.includes('node') || name.includes('firefox')) return '3.02G';
    if (name.includes('vscode')) return '2.35G';
    if (name.includes('angular')) return '1.85G';
    return '0';
  }

  getMockRes(name: string): string {
    if (name.includes('chrome') || name.includes('firefox')) return '300M';
    if (name.includes('node') || name.includes('angular')) return '150M';
    return '0';
  }

  formatProcessTime(cpuTimes: any): string {
    if (!cpuTimes) return '00:00.00';
    const totalSecs = (cpuTimes.user ?? 0) + (cpuTimes.system ?? 0);
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    const hundredths = Math.floor((totalSecs % 1) * 100);
    
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hrs}h${remainingMins.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  }

  getProcessStatus(proc: any): string {
    const s = proc.status || '';
    if (s === 'running' || s === 'R') return 'R';
    if (s === 'sleeping' || s === 'S') return 'S';
    return s.substring(0, 1).toUpperCase();
  }

  isProcessRunning(proc: any): boolean {
    const s = proc.status || '';
    return s === 'running' || s === 'R';
  }
}
