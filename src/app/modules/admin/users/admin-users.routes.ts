import { Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserEditComponent } from './user-edit/user-edit.component';

const ADMIN_USERS_ROUTES: Routes =
  [
    {
      path: '',
      component: UserListComponent
    },
    {
      path: 'edit/:id',
      component: UserEditComponent
    },
    {
      path: '**',
      redirectTo: ''
    }
  ];
export default ADMIN_USERS_ROUTES
