import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MetricsService } from '../services/metrics.service';
import { PluginCardComponent } from '../core/components/plugin-card/plugin-card.component';
import { FormatBytesPipe } from '../core/pipes/format-bytes.pipe';
import { MeasureRender } from '../core/decorators/aop.decorators';

@Component({
  selector: 'app-processes-plugin',
  standalone: true,
  imports: [CommonModule, PluginCardComponent, FormatBytesPipe, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (formattedProcesses(); as procs) {
      <app-plugin-card>
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
        
        <!-- Virtual Scroll Layout -->
        <div class="w-full overflow-x-auto font-mono min-w-[800px]">
          <!-- Header -->
          <div class="flex w-full text-[#888] border-b border-[#111]">
            <div (click)="changeSort('cpu_percent')" class="pr-2 py-0.5 text-right w-12 shrink-0 font-bold cursor-pointer select-none hover:text-white transition-colors">CPU%{{ sortKey() === 'cpu_percent' ? '▼' : '' }}</div>
            <div (click)="changeSort('mem_percent')" class="pr-2 py-0.5 text-right w-12 shrink-0 font-bold cursor-pointer select-none hover:text-white transition-colors">MEM%{{ sortKey() === 'mem_percent' ? '▼' : '' }}</div>
            <div class="pr-2 py-0.5 text-right w-16 shrink-0 font-bold">VIRT</div>
            <div class="pr-2 py-0.5 text-right w-16 shrink-0 font-bold">RES</div>
            <div class="pr-2 py-0.5 text-right w-14 shrink-0 font-bold">PID</div>
            <div (click)="changeSort('username')" class="pr-2 py-0.5 w-16 shrink-0 font-bold cursor-pointer select-none hover:text-white transition-colors">USER{{ sortKey() === 'username' ? '▼' : '' }}</div>
            <div (click)="changeSort('time')" class="pr-2 py-0.5 text-right w-20 shrink-0 font-bold cursor-pointer select-none hover:text-white transition-colors">TIME+{{ sortKey() === 'time' ? '▼' : '' }}</div>
            <div class="pr-2 py-0.5 text-right w-10 shrink-0 font-bold">THR</div>
            <div class="pr-2 py-0.5 text-right w-8 shrink-0 font-bold">NI</div>
            <div class="pr-2 py-0.5 text-center w-6 shrink-0 font-bold">S</div>
            <div (click)="changeSort('io')" class="pr-2 py-0.5 text-right w-12 shrink-0 font-bold cursor-pointer select-none hover:text-white transition-colors">IOR/s{{ sortKey() === 'io' ? '▼' : '' }}</div>
            <div (click)="changeSort('io')" class="pr-2 py-0.5 text-right w-12 shrink-0 font-bold cursor-pointer select-none hover:text-white transition-colors">IOW/s{{ sortKey() === 'io' ? '▼' : '' }}</div>
            <div (click)="changeSort('name')" class="pl-2 py-0.5 font-bold grow cursor-pointer select-none hover:text-white transition-colors">Command (click to pin){{ sortKey() === 'name' ? '▼' : '' }}</div>
          </div>
          
          <!-- Virtual Scroll Body -->
          <cdk-virtual-scroll-viewport itemSize="24" class="w-full h-[400px] overflow-x-hidden">
            <div *cdkVirtualFor="let proc of procs; trackBy: trackByPid"
                 (click)="pin(proc.pid)" 
                 [ngClass]="extendedProcess()?.pid === proc.pid ? 'bg-[#002f00] text-green-300 font-bold border-y border-green-600' : 'even:bg-[#111] hover:bg-[#222]'"
                 class="flex w-full cursor-pointer transition-colors duration-150">
              <div class="pr-2 py-0.5 text-right font-bold w-12 shrink-0" [class]="proc._cpuClass">{{ proc._cpuStr }}</div>
              <div class="pr-2 py-0.5 text-right text-green-500 w-12 shrink-0">{{ proc._memStr }}</div>
              <div class="pr-2 py-0.5 text-right text-[#aaa] w-16 shrink-0">{{ proc._virtStr }}</div>
              <div class="pr-2 py-0.5 text-right text-[#aaa] w-16 shrink-0">{{ proc._resStr }}</div>
              <div class="pr-2 py-0.5 text-right text-white w-14 shrink-0">{{ proc.pid }}</div>
              <div class="pr-2 py-0.5 text-[#aaa] truncate w-16 shrink-0">{{ proc.username }}</div>
              <div class="pr-2 py-0.5 text-right text-[#aaa] w-20 shrink-0">{{ proc._timeStr }}</div>
              <div class="pr-2 py-0.5 text-right text-[#aaa] w-10 shrink-0">{{ proc.num_threads !== undefined ? proc.num_threads : 0 }}</div>
              <div class="pr-2 py-0.5 text-right text-[#aaa] w-8 shrink-0">{{ proc.nice !== undefined ? proc.nice : 0 }}</div>
              <div class="pr-2 py-0.5 text-center w-6 shrink-0" [class]="proc._isRunning ? 'text-green-500 font-bold' : 'text-[#666]'">{{ proc._statusStr }}</div>
              <div class="pr-2 py-0.5 text-right text-[#666] w-12 shrink-0">0</div>
              <div class="pr-2 py-0.5 text-right text-[#666] w-12 shrink-0">0</div>
              <div class="pl-2 py-0.5 text-white font-bold truncate grow">{{ proc.name }}</div>
            </div>
          </cdk-virtual-scroll-viewport>
        </div>
      </app-plugin-card>
    }
  `
})
export class ProcessesPluginComponent {
  private metricsService = inject(MetricsService);
  private bytesPipe = new FormatBytesPipe(); // used internally by getVirt/getRes

  readonly processes = this.metricsService.processes;
  readonly processcount = this.metricsService.processcount;
  readonly sortKey = this.metricsService.processSortKey;
  readonly extendedProcess = this.metricsService.extendedProcess;

  readonly formattedProcesses = computed(() => {
    const procs = this.processes();
    if (!procs) return null;
    
    // Do not slice, expose all processes for Virtual Scroll
    return procs.map((proc: any) => ({
      ...proc,
      _cpuClass: this.cpuClass(proc.cpu_percent),
      _cpuStr: proc.cpu_percent.toFixed(1),
      _memStr: (proc.mem_percent !== undefined ? proc.mem_percent : (proc.memory_percent !== undefined ? proc.memory_percent : 0)).toFixed(1),
      _virtStr: this.getVirt(proc),
      _resStr: this.getRes(proc),
      _timeStr: this.formatProcessTime(proc.cpu_times),
      _statusStr: this.getProcessStatus(proc),
      _isRunning: this.isProcessRunning(proc)
    }));
  });

  @MeasureRender()
  changeSort(key: string) {
    this.metricsService.processSortKey.set(key);
  }

  @MeasureRender()
  pin(pid: number) {
    if (this.extendedProcess()?.pid === pid) {
      this.unpin();
    } else {
      this.metricsService.pinProcess(pid);
    }
  }

  @MeasureRender()
  unpin() {
    this.metricsService.unpinProcess();
  }

  trackByPid(index: number, item: any): number {
    return item.pid;
  }

  cpuClass(cpu: number): string {
    if (cpu >= 80) return 'critical';
    if (cpu >= 50) return 'warning';
    return 'ok';
  }

  getVirt(proc: any): string {
    if (proc.memory_info?.vms !== undefined) {
      return this.bytesPipe.transform(proc.memory_info.vms);
    }
    return this.getMockVirt(proc.name);
  }

  getRes(proc: any): string {
    if (proc.memory_info?.rss !== undefined) {
      return this.bytesPipe.transform(proc.memory_info.rss);
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
