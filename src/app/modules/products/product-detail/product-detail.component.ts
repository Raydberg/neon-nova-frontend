import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'product-detail',
  imports: [],
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent { }
