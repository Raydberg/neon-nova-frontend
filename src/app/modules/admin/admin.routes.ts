import { Routes } from '@angular/router';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { AdminLayoutComponent } from '../../shared/layout/admin-layout/admin-layout.component';

const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        component: DashboardAdminComponent
      },
      {
        path: 'products',
        loadChildren: () => import('./products/admin-products.routes')
      },
      {
        path: 'categories',
        loadChildren: () => import('./categories/admin-categories.routes')
      },
      {
        path: 'users',
        loadChildren: () => import('./users/admin-users.routes')
      },
      // {
      //   path: 'orders',
      //   // loadChildren: () => import('./orders/admin-orders.routes')
      // },
      // {
      //   path: 'transactions',
      //   // loadChildren: () => import('./transactions/admin-transactions.routes')
      // },
      // {
      //   path: 'reports',
      //   // loadChildren: () => import('./reports/admin-reports.routes')
      // },
      // {
      //   path: 'settings',
      //   // loadChildren: () => import('./settings/admin-settings.routes')
      // },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];

export default ADMIN_ROUTES;
