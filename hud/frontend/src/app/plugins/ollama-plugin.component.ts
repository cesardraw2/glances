import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../services/metrics.service';
import { PluginCardComponent } from '../core/components/plugin-card/plugin-card.component';
import { FormatBytesPipe } from '../core/pipes/format-bytes.pipe';

@Component({
  selector: 'app-ollama-plugin',
  standalone: true,
  imports: [CommonModule, PluginCardComponent, FormatBytesPipe],
  template: `
    <app-plugin-card>
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
                  <td class="text-right text-white">{{ model.size | formatBytes }}</td>
                  <td class="text-right text-purple-400">{{ model.size_vram | formatBytes }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </app-plugin-card>
  `
})
export class OllamaPluginComponent {
  private metricsService = inject(MetricsService);
  
  readonly ollamaList = computed(() => {
    const list = this.metricsService.ollama();
    return Array.isArray(list) ? list : [];
  });
}
