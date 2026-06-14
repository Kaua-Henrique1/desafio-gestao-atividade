import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'workdayConversion',
  standalone: true
})
export class WorkdayConversionPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    const points = Number(value) || 0;
    const hours = points * 8;
    const dayLabel = points === 1 ? 'dia' : 'dias';
    return `${points} ${dayLabel} (${hours}h)`;
  }
}

