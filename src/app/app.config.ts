import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withInMemoryScrolling, withPreloading, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { LUCIDE_ICONS } from '@shared/helpers/lucide-icons';
import {provideAnimations} from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withViewTransitions(),
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),
    provideClientHydration(
      withHttpTransferCacheOptions({
        includePostRequests: true,
      })),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    ),
    importProvidersFrom(LucideAngularModule.pick(LUCIDE_ICONS)),
    provideAnimations()
  ]
};
