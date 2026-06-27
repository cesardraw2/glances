import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../../services/metrics.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None, // Necessário para estilizar o innerHTML
  templateUrl: './quicklook-plugin.component.html',
  styleUrl: './quicklook-plugin.component.css'
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
