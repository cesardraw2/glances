import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatBytes',
  standalone: true
})
export class FormatBytesPipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'K', 'M', 'G', 'T'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    if (i < 0) return '0B';
    const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${val}${sizes[i]}`;
  }
}
