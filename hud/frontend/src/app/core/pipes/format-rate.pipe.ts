import { Pipe, PipeTransform } from '@angular/core';
import { FormatBytesPipe } from './format-bytes.pipe';

@Pipe({
  name: 'formatRate',
  standalone: true
})
export class FormatRatePipe implements PipeTransform {
  private bytesPipe = new FormatBytesPipe();

  transform(rate: number | string | null | undefined): string {
    if (rate === undefined || rate === null || rate === 0 || rate === '0') return '0';
    
    // Se for string (caso de network que já vem formatado do backend)
    if (typeof rate === 'string') {
      return rate.replace(' /s', '').replace(' ', '');
    }

    // Se for numero
    if (isNaN(rate)) return '0';
    return this.bytesPipe.transform(rate);
  }
}
