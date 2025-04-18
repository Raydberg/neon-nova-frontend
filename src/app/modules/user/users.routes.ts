import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';


export default [
  {
    path: '',
    component: ProfileComponent
  },
  {
    path: 'perfil',
    component: ProfileComponent
  },
] as Routes;
