import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductSearchComponent } from './product-search/product-search.component';
import { ProductFavoriteComponent } from './product-favorite/product-favorite.component';

const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductListComponent
  },
  {
    path: 'favorite',
    component: ProductFavoriteComponent
  },
  {
    path: 'search',
    component: ProductSearchComponent
  },
  {
    path: ':id',
    component: ProductDetailComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
export default PRODUCTS_ROUTES;
