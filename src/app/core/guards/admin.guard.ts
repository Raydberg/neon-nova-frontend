import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router)

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }
  if (authService.isLoggedIn()) {
    router.navigate([""])
    return false
  }

  router.navigate(["/auth/login"], {
    queryParams: { returnUrl: state.url }
  })
  return false
};
