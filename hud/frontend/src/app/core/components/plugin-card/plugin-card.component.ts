import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plugin-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="font-mono text-[12px] text-[#ccc] leading-relaxed select-none w-full mb-4 pb-4 border-b border-[#111]">
      <ng-content></ng-content>
    </div>
  `
})
export class PluginCardComponent {
}
