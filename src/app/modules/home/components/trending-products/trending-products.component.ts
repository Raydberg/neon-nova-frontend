import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'trending-products',
  imports: [],
  templateUrl: './trending-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendingProductsComponent { }
