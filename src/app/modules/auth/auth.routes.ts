import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { GoogleCallbackComponent } from './google-callback/google-callback.component';

const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'forgot',
    component: ForgotPasswordComponent
  },
  {
    path: 'google-callback',
    component: GoogleCallbackComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
export default AUTH_ROUTES;
