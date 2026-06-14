import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countdown',
  standalone: true
})
export class CountdownPipe implements PipeTransform {
  transform(dueDate: string | null | undefined, columnId?: string): string {
    // 🚀 REGRA NOVA: Se a tarefa já está na coluna "Feito", ignora o prazo e carimba como Concluída!
    if (columnId === 'col-feito') {
      return '✓ Concluída';
    }

    if (!dueDate) return 'Sem prazo';

    // 🚀 CORREÇÃO DE FUSO HORÁRIO:
    // Troca os hifens '-' por barras '/' para forçar o JavaScript a ler a data
    // no fuso horário local do navegador do usuário, e não em UTC.
    const dateParts = dueDate.split('-');
    if (dateParts.length !== 3) return 'Sem prazo';

    const due = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
    if (isNaN(due.getTime())) return 'Sem prazo';

    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Calcula a diferença exata em milissegundos e converte para dias inteiros
    const diffMs = due.getTime() - today.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // Retornos calibrados
    if (days > 0) {
      return `📅 ${days} dia${days === 1 ? '' : 's'} restante${days === 1 ? '' : 's'}`;
    }
    if (days === 0) {
      return '⚠️ Entrega HOJE!';
    }
    return `🚨 ATRASADO (${Math.abs(days)} dia${Math.abs(days) === 1 ? '' : 's'})`;
  }
}
