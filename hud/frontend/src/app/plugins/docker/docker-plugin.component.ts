import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MetricsService } from '../../services/metrics.service';
import { PluginCardComponent } from '../../core/components/plugin-card/plugin-card.component';
import { MeasureRender } from '../../core/decorators/aop.decorators';

@Component({
  selector: 'app-docker-plugin',
  standalone: true,
  imports: [CommonModule, PluginCardComponent, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './docker-plugin.component.html',
  styleUrl: './docker-plugin.component.css'
})
export class DockerPluginComponent {
  private metricsService = inject(MetricsService);
  readonly containers = this.metricsService.containers;
  readonly sortKey = this.metricsService.containerSortKey;
  readonly pinnedContainerId = signal<string | null>(null);

  readonly formattedContainers = computed(() => {
    let conts = this.containers() || [];
    const pinnedId = this.pinnedContainerId();
    if (pinnedId && conts.length > 0) {
      const idx = conts.findIndex((c: any) => (c.id || c.name) === pinnedId);
      if (idx > 0) {
        conts = [conts[idx], ...conts.slice(0, idx), ...conts.slice(idx + 1)];
      }
    }
    return conts;
  });

  readonly extendedContainer = computed(() => {
    const id = this.pinnedContainerId();
    if (!id) return null;
    const all = this.formattedContainers();
    return all.find((c: any) => (c.id || c.name) === id) || null;
  });

  @MeasureRender()
  changeSort(key: string) {
    this.metricsService.containerSortKey.set(key);
  }

  @MeasureRender()
  pin(id: string) {
    if (this.pinnedContainerId() === id) {
      this.pinnedContainerId.set(null);
    } else {
      this.pinnedContainerId.set(id);
    }
  }

  unpin() {
    this.pinnedContainerId.set(null);
  }

  trackById(index: number, item: any): string {
    return item.id || item.name;
  }
}
