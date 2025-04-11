import { ChangeDetectionStrategy, Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  UserIcon,
  MailIcon,
  KeyIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
  AlertCircleIcon,
  CheckIcon,
  PhoneIcon,
  InfoIcon,
  XIcon
} from 'lucide-angular';

@Component({
  selector: 'auth-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  // Referencias a elementos DOM para animaciones
  @ViewChild('formStep1', { static: false }) formStep1!: ElementRef;
  @ViewChild('formStep2', { static: false }) formStep2!: ElementRef;
  @ViewChild('stepsIndicator', { static: false }) stepsIndicator!: ElementRef;

  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Iconos
  readonly UserIcon = UserIcon;
  readonly MailIcon = MailIcon;
  readonly KeyIcon = KeyIcon;
  readonly EyeIcon = EyeIcon;
  readonly EyeOffIcon = EyeOffIcon;
  readonly LoaderIcon = LoaderIcon;
  readonly AlertCircleIcon = AlertCircleIcon;
  readonly CheckIcon = CheckIcon;
  readonly PhoneIcon = PhoneIcon;
  readonly InfoIcon = InfoIcon;
  readonly XIcon = XIcon;

  // Señales para el estado del componente
  isPasswordVisible = signal(false);
  isConfirmPasswordVisible = signal(false);
  isRegistering = signal(false);
  registerError = signal<string | null>(null);
  currentStep = signal(1);
  passwordStrength = signal<'weak' | 'medium' | 'strong' | null>(null);
  termsAccepted = signal(false);
  isAnimating = signal(false); // Para controlar animaciones
  slideDirection = signal<'next' | 'prev'>('next'); // Para determinar dirección de la animación

  // Formulario reactivo
  registerForm!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.registerForm = this.fb.group({
      // Paso 1: Información personal
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[0-9]{8,15}$/)]],

      // Paso 2: Credenciales
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Monitorizar cambios en la contraseña para evaluar su fortaleza
    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.checkPasswordStrength(value);
    });
  }

  passwordRequirements = signal({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Método para validar que las contraseñas coincidan
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  // Evaluar la fortaleza de la contraseña
  private checkPasswordStrength(password: string) {
    if (!password) {
      this.passwordStrength.set(null);
      this.passwordRequirements.set({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
      return;
    }

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    const isLongEnough = password.length >= 8;

    // Actualizar estado de requisitos
    this.passwordRequirements.set({
      length: isLongEnough,
      uppercase: hasUppercase,
      lowercase: hasLowercase,
      number: hasDigit,
      special: hasSpecial
    });

    const strengths = [hasLowercase, hasUppercase, hasDigit, hasSpecial, isLongEnough];
    const strengthScore = strengths.filter(Boolean).length;

    if (strengthScore <= 2) {
      this.passwordStrength.set('weak');
    } else if (strengthScore <= 4) {
      this.passwordStrength.set('medium');
    } else {
      this.passwordStrength.set('strong');
    }
  }

  // Alternar visibilidad de la contraseña
  togglePasswordVisibility() {
    this.isPasswordVisible.update(state => !state);
  }

  // Alternar visibilidad de la confirmación de contraseña
  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible.update(state => !state);
  }

  // Aceptar términos y condiciones
  toggleTermsAccepted() {
    this.termsAccepted.update(state => !state);
    this.registerForm.patchValue({ termsAccepted: this.termsAccepted() });
  }

  // Avanzar al siguiente paso del formulario con animación CSS
  nextStep() {
    if (this.isAnimating()) return;

    const currentStep = this.currentStep();

    if (currentStep === 1) {
      // Validar campos del paso 1
      if (
        this.registerForm.get('firstName')?.invalid ||
        this.registerForm.get('lastName')?.invalid ||
        this.registerForm.get('email')?.invalid ||
        this.registerForm.get('phone')?.invalid
      ) {
        this.registerForm.get('firstName')?.markAsTouched();
        this.registerForm.get('lastName')?.markAsTouched();
        this.registerForm.get('email')?.markAsTouched();
        this.registerForm.get('phone')?.markAsTouched();
        return;
      }

      this.isAnimating.set(true);
      this.slideDirection.set('next');

      // Mostrar el paso 2
      setTimeout(() => {
        this.currentStep.set(currentStep + 1);

        // Esperar a que termine la transición CSS
        setTimeout(() => {
          this.isAnimating.set(false);
        }, 500); // Coincide con la duración de la animación CSS
      }, 300);
    }
  }

  // Volver al paso anterior con animación CSS
  prevStep() {
    if (this.isAnimating()) return;

    const currentStep = this.currentStep();

    if (currentStep > 1) {
      this.isAnimating.set(true);
      this.slideDirection.set('prev');

      setTimeout(() => {
        this.currentStep.set(currentStep - 1);

        setTimeout(() => {
          this.isAnimating.set(false);
        }, 500);
      }, 300);
    }
  }

  // Obtener clase de color según la fortaleza de la contraseña
  getPasswordStrengthClass(): string {
    switch (this.passwordStrength()) {
      case 'weak':
        return 'progress-error';
      case 'medium':
        return 'progress-warning';
      case 'strong':
        return 'progress-success';
      default:
        return '';
    }
  }

  // Obtener porcentaje según la fortaleza de la contraseña
  getPasswordStrengthPercentage(): number {
    switch (this.passwordStrength()) {
      case 'weak':
        return 33;
      case 'medium':
        return 66;
      case 'strong':
        return 100;
      default:
        return 0;
    }
  }

  // Texto descriptivo según la fortaleza de la contraseña
  getPasswordStrengthText(): string {
    switch (this.passwordStrength()) {
      case 'weak':
        return 'Débil';
      case 'medium':
        return 'Media';
      case 'strong':
        return 'Fuerte';
      default:
        return '';
    }
  }

  // Enviar formulario de registro
  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isRegistering.set(true);
    this.registerError.set(null);

    // Simulación de registro
    setTimeout(() => {
      // En una aplicación real, aquí iría la llamada al servicio de registro
      console.log('Datos de registro:', this.registerForm.value);

      this.router.navigate(['/auth/login']);
    }, 1500);
  }
}
