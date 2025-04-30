import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'auth-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private authService = inject(AuthService)

  isPasswordVisible = signal(false);
  isAuthenticating = signal(false);
  authError = signal<string | null>(null);
  rememberMe = signal(false);

  loginForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadSavedEmail();
  }

  private initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
      ,
      rememberMe: [false]
    });
  }

  private loadSavedEmail() {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail, rememberMe: true });
      this.rememberMe.set(true);
    }
  }

  togglePasswordVisibility() {
    this.isPasswordVisible.update(state => !state);
  }

  toggleRememberMe() {
    this.rememberMe.update(state => !state);
    this.loginForm.patchValue({ rememberMe: this.rememberMe() });
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isAuthenticating.set(true);
    this.authError.set(null);

    const { email, password, rememberMe } = this.loginForm.value;

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.authService.login({ email, password }).subscribe({
      next: (success) => {
        if (success) {
          if (this.authService.isAdmin()) {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
            this.router.navigateByUrl(returnUrl);
          } else {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigateByUrl(returnUrl);
          }
        } else {
          this.authError.set('Credenciales incorrectas. Por favor, verifique e intente nuevamente.');
          this.isAuthenticating.set(false);
        }
      },
      error: (error) => {
        this.authError.set('Error en el servidor. Por favor, intente más tarde.');
        this.isAuthenticating.set(false);
        console.error('Error de login:', error);
      }
    });
  }

  loginWithGoogle() {
    this.isAuthenticating.set(true);
    this.authError.set(null);

    this.authService.loginWithGoogle()
  }
}
