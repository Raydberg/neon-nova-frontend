import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'product-list',
  imports: [],
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent { }
