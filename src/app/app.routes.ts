import { Routes } from '@angular/router';
import { HeroSectionComponent } from './modules/home/components/hero-section/hero-section.component';
import { UserLayoutComponent } from './shared/layout/user-layout/user-layout.component';
import {adminGuard} from '@core/guards/admin.guard';

export const routes: Routes =
  [
    {
      path: '',
      component: UserLayoutComponent,
      children: [
        { path: '', loadComponent: () => import('./modules/home/home.component') },
        { path: 'product', loadChildren: () => import('./modules/products/products.routes') },
        // { path: 'auth', loadChildren: () => import('./modules/auth/auth.routes') },
      ]
    },
    {
      path: 'auth',
      component: UserLayoutComponent,
      loadChildren: () => import('./modules/auth/auth.routes')
    },
    {
      path: 'admin',
      // canActivate:[adminGuard],
      loadChildren: () => import('./modules/admin/admin.routes')
    },
    {
      path: '**',
      redirectTo: ''
    }
  ];
