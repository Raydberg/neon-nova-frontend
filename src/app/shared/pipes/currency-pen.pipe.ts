import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyPEN',
  standalone: true
})
export class CurrencyPENPipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (value === undefined) return 'S/\u00A00.00';
    return `S/\u00A0${value.toFixed(2)}`;
  }
}
