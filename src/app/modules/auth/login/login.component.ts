import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  KeyIcon,
  MailIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
  AlertCircleIcon
} from 'lucide-angular';

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
  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Iconos
  readonly KeyIcon = KeyIcon;
  readonly MailIcon = MailIcon;
  readonly EyeIcon = EyeIcon;
  readonly EyeOffIcon = EyeOffIcon;
  readonly LoaderIcon = LoaderIcon;
  readonly AlertCircleIcon = AlertCircleIcon;

  // Señales para el estado del componente
  isPasswordVisible = signal(false);
  isAuthenticating = signal(false);
  authError = signal<string | null>(null);
  rememberMe = signal(false);

  // Formulario reactivo
  loginForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadSavedEmail();
  }

  private initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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

    // Guardar email si "recordarme" está activado
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    // Simulación de autenticación
    setTimeout(() => {
      // Simular validación de credenciales
      if (email === 'admin@example.com' && password === 'password') {
        // Simular login exitoso
        this.router.navigate(['/admin']);
      } else {
        // Simular error de login
        this.authError.set('Credenciales incorrectas. Por favor, verifique e intente nuevamente.');
        this.isAuthenticating.set(false);
      }
    }, 1500);
  }

  loginWithGoogle() {
    this.isAuthenticating.set(true);
    this.authError.set(null);

    // Simulación de autenticación con Google
    setTimeout(() => {
      // Aquí iría la implementación real de login con Google
      this.router.navigate(['/admin']);
    }, 1500);
  }
}
