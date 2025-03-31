import { Routes } from '@angular/router';
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductEditComponent } from './product-edit/product-edit.component';
import { ProductCreateComponent } from './product-create/product-create.component';

const ADMIN_PRODUCTS_ROUTES: Routes =
  [
    {
      path: '',
      component: ProductsListComponent
    },
    {
      path: 'edit/:id',
      component: ProductEditComponent
    },
    {
      path: 'create',
      component: ProductCreateComponent
    },
    {
      path: '**',
      redirectTo: ''
    }

  ];
export default ADMIN_PRODUCTS_ROUTES
