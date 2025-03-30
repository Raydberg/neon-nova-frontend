import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'admin-products-list',
  imports: [],
  templateUrl: './products-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent { }
