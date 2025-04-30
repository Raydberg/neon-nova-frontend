import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyPEN',
  standalone: true
})
export class CurrencyPENPipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (value === undefined) return 'S/ 0.00';
    return `S/ ${value.toFixed(2)}`;
  }
}
