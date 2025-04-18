import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen w-full flex items-center justify-center">
      <div class="text-center">
        <h2 class="text-xl mb-4">Completando inicio de sesión...</h2>
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        const success = this.authService.handleGoogleCallback(token);

        if (success) {
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.router.navigate(['/auth/login'], {
            queryParams: { error: 'Error al procesar la autenticación de Google' }
          });
        }
      } else {
        this.router.navigate(['/auth/login'], {
          queryParams: { error: 'No se recibió token de autenticación' }
        });
      }
    });
  }
}
