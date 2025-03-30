import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'featured-products',
  imports: [],
  templateUrl: './featured-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedProductsComponent { }
