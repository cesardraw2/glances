import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'alertClass',
  standalone: true
})
export class AlertClassPipe implements PipeTransform {
  transform(percent: number | null | undefined, type: 'text' | 'bg' = 'text'): string {
    if (percent === undefined || percent === null || isNaN(percent)) return '';
    
    if (type === 'bg') {
      if (percent >= 90) return 'bg-critical';
      if (percent >= 70) return 'bg-warning';
      return 'bg-ok';
    }

    // Default text color
    if (percent >= 90) return 'critical font-bold';
    if (percent >= 70) return 'warning font-bold';
    return 'ok font-bold';
  }
}
