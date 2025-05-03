import {Routes} from '@angular/router';
import {UserLayoutComponent} from '@shared/layout/user-layout/user-layout.component';
import {adminGuard} from '@core/guards/admin.guard';
import { SuccessComponent } from './shared/components/success/success.component';//se agrego la importacion de SuccessComponent

export const routes: Routes =
  [
    {
      path: '',
      component: UserLayoutComponent,
      children: [
        {path: '', loadComponent: () => import('./modules/home/home.component')},
        {path: 'products', loadChildren: () => import('./modules/products/products.routes')},
        {path: 'cart', loadChildren: () => import('./modules/cart/cart.routes')},
        {path: 'checkout', loadChildren: () => import('./modules/checkout/checkout.routes')},
        {path: 'account/orders', loadChildren: () => import('./modules/orders/orders.routes')},
        {path: 'user', loadChildren: () => import("./modules/user/users.routes")},
        { path: 'success', component: SuccessComponent },
      ]
    },
    {
      path: 'auth',
      component: UserLayoutComponent,
      loadChildren: () => import('./modules/auth/auth.routes')
    },
    {
      path: 'admin',
      canActivate:[adminGuard],
      loadChildren: () => import('./modules/admin/admin.routes'),
      data: {preload: false}
    },
    {
      path: '**',
      redirectTo: ''
    }
  ];
