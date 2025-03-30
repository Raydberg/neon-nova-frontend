import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'product-search',
  imports: [],
  templateUrl: './product-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSearchComponent { }
