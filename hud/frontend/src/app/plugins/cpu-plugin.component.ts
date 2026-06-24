import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cpu()) {
      <div class="font-mono text-[12px] text-white leading-relaxed select-none">
        <div class="grid grid-cols-12 gap-x-2">
          <!-- Coluna 1: CPU, user, system, idle -->
          <div class="col-span-4 flex flex-col space-y-0.5">
            <div class="flex justify-between">
              <span class="text-[#888] font-bold">CPU</span>
              <span [class]="getAlertClass(cpu().total)">{{ cpu().total }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">user:</span>
              <span [class]="getBadgeClass(cpu().total, 'user')">{{ cpu().user }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">system:</span>
              <span [class]="getBadgeClass(cpu().total, 'system')">{{ cpu().system }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">idle:</span>
              <span>{{ cpu().idle }}%</span>
            </div>
          </div>

          <!-- Coluna 2: nice, irq, iowait, steal -->
          <div class="col-span-4 flex flex-col space-y-0.5">
            <div class="flex justify-between">
              <span class="text-[#888]">nice:</span>
              <span>{{ cpu().nice !== undefined ? cpu().nice + '%' : '0%' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">irq:</span>
              <span [class]="getBadgeClass(cpu().total, 'irq')">{{ cpu().irq !== undefined ? cpu().irq + '%' : '0%' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">iowait:</span>
              <span [class]="getBadgeClass(cpu().total, 'iowait')">{{ cpu().iowait !== undefined ? cpu().iowait + '%' : '0%' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">steal:</span>
              <span>{{ cpu().steal !== undefined ? cpu().steal + '%' : '0%' }}</span>
            </div>
          </div>

          <!-- Coluna 3: ctx_sw, inter, sw_int -->
          <div class="col-span-4 flex flex-col space-y-0.5">
            <div class="flex justify-between">
              <span class="text-[#888]">ctx_sw:</span>
              <span class="text-green-500">{{ cpu().ctx_switches }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">inter:</span>
              <span>{{ cpu().interrupts }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">sw_int:</span>
              <span>{{ cpu().soft_interrupts !== undefined ? cpu().soft_interrupts : '0' }}</span>
            </div>
            <div>&nbsp;</div>
          </div>
        </div>

        <!-- Cores individuais (Modo Per-CPU acionado por '1') -->
        @if (showPerCpu() && cpu().cores) {
          <div class="mt-2 pt-1 border-t border-[#111] grid grid-cols-4 gap-x-2">
            @for (core of cpu().cores; track core.id) {
              <div class="flex justify-between text-[11px] px-1 border border-[#111]">
                <span class="text-[#888]">Core{{ core.id }}</span>
                <span [class]="getAlertClass(core.percent)">{{ core.percent }}%</span>
              </div>
            }
          </div>
        }
      </div>
    }
  `
})
export class CpuPluginComponent {
  private metricsService = inject(MetricsService);
  readonly cpu = this.metricsService.cpu;
  readonly showPerCpu = this.metricsService.showPerCpu;

  getAlertClass(percent: number): string {
    if (percent >= 90) return 'critical font-bold';
    if (percent >= 70) return 'warning font-bold';
    return 'ok font-bold';
  }

  getBadgeClass(percent: number, type: string): string {
    // Retorna a cor de fundo (badge) baseada nas taxas
    if (percent >= 90) return 'bg-critical';
    if (percent >= 70) return 'bg-warning';
    return 'bg-ok';
  }
}
