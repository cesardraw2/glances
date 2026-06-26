import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';

@Component({
  selector: 'app-ollama-plugin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="font-mono text-[12px] text-[#ccc] leading-relaxed select-none w-full mb-4 pb-4 border-b border-[#111]">
      <div class="text-white font-bold mb-2">
        OLLAMA {{ ollamaList().length }} models loaded in VRAM
      </div>

      @if (ollamaList().length === 0) {
        <div class="text-[#888] italic">No active models.</div>
      } @else {
        <div class="w-full overflow-x-auto font-mono">
          <table class="w-full text-left font-mono">
            <thead>
              <tr class="text-[#ccc]">
                <th class="font-normal text-left w-[60%]">Model</th>
                <th class="font-normal text-right w-[20%]">Size</th>
                <th class="font-normal text-right w-[20%]">VRAM</th>
              </tr>
            </thead>
            <tbody>
              @for (model of ollamaList(); track model.name; let idx = $index) {
                <tr>
                  <td class="text-left text-green-500 font-bold truncate">{{ model.name }}</td>
                  <td class="text-right text-white">{{ format(model.size) }}</td>
                  <td class="text-right text-purple-400">{{ format(model.size_vram) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class OllamaPluginComponent {
  private metricsService = inject(MetricsService);
  
  readonly ollamaList = computed(() => {
    const list = this.metricsService.ollama();
    return Array.isArray(list) ? list : [];
  });

  format(bytes: number): string {
    return this.metricsService.formatBytes(bytes);
  }
}
