import { Routes } from '@angular/router';
import { HeroSectionComponent } from './modules/home/components/hero-section/hero-section.component';
import { HomeComponent } from './modules/home/home.component';

export const routes: Routes =
  [
    {
      path: '',
      component: HomeComponent
    },
    {
      path: '**',
      redirectTo: ''
    }
  ];
