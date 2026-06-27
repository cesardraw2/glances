import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None, // Necessário para estilizar o innerHTML
  template: `
    <div class="font-mono text-[12px] text-white leading-relaxed select-none">
      <!-- CPU Row -->
      @if (cpu()) {
        <div class="flex items-center space-x-1">
          <span class="w-10 text-[#888]">CPU</span>
          <span class="text-[#999] tracking-tight">
            [<span [innerHTML]="getAsciiBar(cpu().total, 12, 'ok')"></span>]
          </span>
          <span class="text-right w-10 text-white font-bold ml-1">{{ cpu().total }}%</span>
        </div>
      }
      
      <!-- MEM Row -->
      @if (mem()) {
        <div class="flex items-center space-x-1">
          <span class="w-10 text-[#888]">MEM</span>
          <span class="text-[#999] tracking-tight">
            [<span [innerHTML]="getAsciiBar(mem().percent, 12, 'careful')"></span>]
          </span>
          <span class="text-right w-10 text-white font-bold ml-1">{{ mem().percent }}%</span>
        </div>
      }

      <!-- SWAP Row -->
      @if (mem()) {
        <div class="flex items-center space-x-1">
          <span class="w-10 text-[#888]">SWAP</span>
          <span class="text-[#999] tracking-tight">
            [<span [innerHTML]="getAsciiBar(mem().swap_percent, 12, 'ok')"></span>]
          </span>
          <span class="text-right w-10 text-white font-bold ml-1">{{ mem().swap_percent }}%</span>
        </div>
      }
    </div>
  `
})
export class QuickLookComponent {
  private metricsService = inject(MetricsService);
  readonly cpu = this.metricsService.cpu;
  readonly mem = this.metricsService.mem;

  getAsciiBar(percent: number, width: number, colorClass: string): string {
    const filledCount = Math.round((percent / 100) * width);
    const emptyCount = width - filledCount;
    const fillChar = '|';
    const emptyChar = '.';
    
    if (filledCount === 0) return emptyChar.repeat(width);

    // Mapeia classes de cores de texto oficiais do Glances
    const colorStyle = colorClass === 'careful' ? 'text-blue-500 font-bold' : 'text-green-500 font-bold';
    return `<span class="${colorStyle}">${fillChar.repeat(filledCount)}</span>` + emptyChar.repeat(emptyCount);
  }
}
