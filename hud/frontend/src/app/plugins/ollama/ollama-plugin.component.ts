import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsService } from '../../services/metrics.service';
import { PluginCardComponent } from '../../core/components/plugin-card/plugin-card.component';
import { FormatBytesPipe } from '../../core/pipes/format-bytes.pipe';

@Component({
  selector: 'app-ollama-plugin',
  standalone: true,
  imports: [CommonModule, PluginCardComponent, FormatBytesPipe],
  templateUrl: './ollama-plugin.component.html',
  styleUrl: './ollama-plugin.component.css'
})
export class OllamaPluginComponent {
  private metricsService = inject(MetricsService);
  
  readonly ollamaList = computed(() => {
    const list = this.metricsService.ollama();
    return Array.isArray(list) ? list : [];
  });
}
