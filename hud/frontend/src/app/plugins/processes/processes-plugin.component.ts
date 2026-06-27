import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MetricsService } from '../../services/metrics.service';
import { PluginCardComponent } from '../../core/components/plugin-card/plugin-card.component';
import { FormatBytesPipe } from '../../core/pipes/format-bytes.pipe';
import { MeasureRender } from '../../core/decorators/aop.decorators';

@Component({
  selector: 'app-processes-plugin',
  standalone: true,
  imports: [CommonModule, PluginCardComponent, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './processes-plugin.component.html',
  styleUrl: './processes-plugin.component.css'
})
export class ProcessesPluginComponent {
  private metricsService = inject(MetricsService);
  private bytesPipe = new FormatBytesPipe(); // used internally by getVirt/getRes

  readonly processes = this.metricsService.processes;
  readonly processcount = this.metricsService.processcount;
  readonly sortKey = this.metricsService.processSortKey;
  readonly extendedProcess = this.metricsService.extendedProcess;

  readonly formattedProcesses = computed(() => {
    let procs = this.processes() || [];
    const pinnedId = this.extendedProcess()?.pid;
    if (pinnedId && procs.length > 0) {
      const idx = procs.findIndex((p: any) => p.pid === pinnedId);
      if (idx > 0) {
        procs = [procs[idx], ...procs.slice(0, idx), ...procs.slice(idx + 1)];
      }
    }
    return procs;
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
