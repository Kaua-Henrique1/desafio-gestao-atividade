import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'workdayConversion',
  standalone: true
})
export class WorkdayConversionPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    const points = Number(value) || 0;

    const days = points / 5;
    const hours = days * 8;

    const dayLabel = days === 1 ? 'dia' : 'dias';
    const daysFormatted = days.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    const hoursFormatted = hours.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

    return `${daysFormatted} ${dayLabel} (${hoursFormatted}h)`;
  }
}
