import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <div class="text-center">
        <h2 class="text-2xl font-bold mb-4">Procesando inicio de sesión...</h2>
        <div class="loading loading-spinner loading-lg"></div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    // Get the token from the query parameters
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        // Process the token received from the backend
        // this.authService.handleGoogleLoginCallback();

        // Redirect based on user role
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      } else {
        // Handle error case (no token)
        this.router.navigate(['/auth/login'], {
          queryParams: { error: 'Error en autenticación con Google' }
        });
      }
    });
  }
}
