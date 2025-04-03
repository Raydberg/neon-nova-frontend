import { Routes } from '@angular/router';
import { CategoriesListComponent } from './categories-list/categories-list.component';
import { CategoriesEditComponent } from './categories-edit/categories-edit.component';

const ADMIN_CATEGORIES_ROUTES: Routes =
  [
    {
      path: '',
      component: CategoriesListComponent
    },
    {
      path: 'edit/:id',
      component: CategoriesEditComponent
    },
    {
      path: '**',
      redirectTo: ''
    }
  ];
export default ADMIN_CATEGORIES_ROUTES
