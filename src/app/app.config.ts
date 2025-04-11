import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {PreloadAllModules, provideRouter, withPreloading, withViewTransitions} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {authInterceptor} from '@core/interceptors/auth.interceptor';
import {provideClientHydration, withHttpTransferCacheOptions} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(
      routes,
      withViewTransitions(),
      withPreloading(PreloadAllModules)
    ),
    provideClientHydration(
      withHttpTransferCacheOptions({
        includePostRequests: true,
      })),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    )
  ]
};
