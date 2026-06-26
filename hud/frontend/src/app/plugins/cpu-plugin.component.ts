import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';
import { PluginCardComponent } from '../core/components/plugin-card/plugin-card.component';
import { AlertClassPipe } from '../core/pipes/alert-class.pipe';

@Component({
  selector: 'app-cpu-plugin',
  standalone: true,
  imports: [CommonModule, AlertClassPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cpu()) {
      <div class="font-mono text-[12px] text-white leading-relaxed select-none w-full mb-4 pb-4 border-b border-[#111]">
        <div class="grid grid-cols-12 gap-x-2">
          <!-- Coluna 1: CPU, user, system, idle -->
          <div class="col-span-4 flex flex-col space-y-0.5">
            <div class="flex justify-between">
              <span class="text-[#888] font-bold">CPU</span>
              <span [class]="cpu().total | alertClass">{{ cpu().total }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">user:</span>
              <span [class]="cpu().total | alertClass:'bg'">{{ cpu().user }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">system:</span>
              <span [class]="cpu().total | alertClass:'bg'">{{ cpu().system }}%</span>
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
              <span [class]="cpu().total | alertClass:'bg'">{{ cpu().irq !== undefined ? cpu().irq + '%' : '0%' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#888]">iowait:</span>
              <span [class]="cpu().total | alertClass:'bg'">{{ cpu().iowait !== undefined ? cpu().iowait + '%' : '0%' }}</span>
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
                <span [class]="core.percent | alertClass">{{ core.percent }}%</span>
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
}
