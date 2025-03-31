import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'product-favorite',
  imports: [],
  templateUrl: './product-favorite.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFavoriteComponent { }
