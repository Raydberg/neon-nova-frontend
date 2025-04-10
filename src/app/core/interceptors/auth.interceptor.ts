import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  // Verifica si hay un token y user logueado
  if (authService.isLoggedIn()) {
    const token = authService.token();
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
      return next(authReq)
    }
  }
  return next(req)
};
