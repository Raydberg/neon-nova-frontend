import { Routes } from '@angular/router';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { AdminLayoutComponent } from '../../shared/layout/admin-layout/admin-layout.component';
import { adminGuard } from '@app/core/guards/admin.guard';

const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    // canActivate:[adminGuard],
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
      {
        path: "profile",
        loadComponent: () => import("./profile/profile.component")
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];

export default ADMIN_ROUTES;
