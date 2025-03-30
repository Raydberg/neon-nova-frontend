import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appCurrentFormat',
})
export class CurrentFormatPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return value;
  }

}
