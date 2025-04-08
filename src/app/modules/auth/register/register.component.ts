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
  InfoIcon,XIcon
} from 'lucide-angular';
import { gsap } from 'gsap';

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
  isAnimating = signal(false); // Nueva señal para controlar animaciones

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

  // Avanzar al siguiente paso del formulario con animación
  nextStep() {
    // Prevenir multiples clicks durante la animación
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

      // Iniciar animación
      this.isAnimating.set(true);

      // Animar salida del paso 1
      const tl = gsap.timeline({
        onComplete: () => {
          this.currentStep.set(currentStep + 1);
          this.animateStepTransition(1, 2);
        }
      });

      tl.to(this.formStep1.nativeElement, {
        opacity: 0,
        x: -20,
        duration: 0.4,
        ease: "back.in(1.4)"
      });

      // Actualizar indicador de pasos
      this.animateStepIndicator(1, 2);
    }
  }

  // Volver al paso anterior con animación
  prevStep() {
    // Prevenir multiples clicks durante la animación
    if (this.isAnimating()) return;

    const currentStep = this.currentStep();

    if (currentStep > 1) {
      // Iniciar animación
      this.isAnimating.set(true);

      // Animar salida del paso 2
      const tl = gsap.timeline({
        onComplete: () => {
          this.currentStep.set(currentStep - 1);
          this.animateStepTransition(2, 1);
        }
      });

      tl.to(this.formStep2.nativeElement, {
        opacity: 0,
        x: 20,
        duration: 0.4,
        ease: "back.in(1.4)"
      });

      // Actualizar indicador de pasos
      this.animateStepIndicator(2, 1);
    }
  }

  // Animación para la transición entre pasos
  private animateStepTransition(from: number, to: number) {
    const enterElement = to === 1 ? this.formStep1.nativeElement : this.formStep2.nativeElement;

    // Asegurarnos de que el elemento esté visible antes de animarlo
    gsap.set(enterElement, {
      display: 'block',
      opacity: 0,
      x: to > from ? 20 : -20,
      clearProps: "transform" // Esto evita problemas de rendimiento
    });

    // Animar entrada con una transición más suave
    gsap.to(enterElement, {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        this.isAnimating.set(false);
      }
    });
  }

  // Animación para el indicador de pasos
  // private animateStepIndicator(from: number, to: number) {
  //   if (!this.stepsIndicator) return;

  //   const steps = this.stepsIndicator.nativeElement.querySelectorAll('.step');

  //   if (to > from) {
  //     // Animación cuando avanzamos al siguiente paso
  //     gsap.to(steps[1], {
  //       keyframes: [
  //         { scale: 1.1, duration: 0.2 },
  //         { scale: 1, duration: 0.2 }
  //       ]
  //     });
  //   } else {
  //     // Animación cuando retrocedemos
  //     gsap.to(steps[0], {
  //       keyframes: [
  //         { scale: 1.1, duration: 0.2 },
  //         { scale: 1, duration: 0.2 }
  //       ]
  //     });
  //   }
  // }

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

  // Animación de registro exitoso
  private animateStepIndicator(from: number, to: number) {
    if (!this.stepsIndicator) return;

    const stepsContainer = this.stepsIndicator.nativeElement;
    const steps = stepsContainer.querySelectorAll('.step');

    // Resetear cualquier transformación previa
    gsap.set(stepsContainer, {
      clearProps: "all" // Elimina todas las propiedades añadidas por GSAP
    });

    gsap.set(steps, {
      clearProps: "all" // Limpia cualquier transformación anterior en los pasos
    });

    // Animar solo el paso que corresponde sin afectar a la línea
    if (to > from) {
      // Animación cuando avanzamos (solo el círculo, no la línea)
      gsap.to(steps[1], {
        scale: 1.2,
        duration: 0.2,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(steps[1], {
            scale: 1,
            duration: 0.2,
            ease: "power2.in",
            clearProps: "all" // Importante: limpiar props al finalizar
          });
        }
      });
    } else {
      // Animación cuando retrocedemos (solo el círculo, no la línea)
      gsap.to(steps[0], {
        scale: 1.2,
        duration: 0.2,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(steps[0], {
            scale: 1,
            duration: 0.2,
            ease: "power2.in",
            clearProps: "all" // Importante: limpiar props al finalizar
          });
        }
      });
    }
  }
// Animación de registro exitoso
private animateSuccessRegistration() {
  // Animación para el botón de envío
  gsap.to(".btn-primary", {
    scale: 1.05,
    duration: 0.2,
    yoyo: true,
    repeat: 1
  });

  // Crear efecto de confeti o partículas
  const container = document.querySelector('.card-body');
  if (container) {
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 8 + 4;

      // Estilos para las partículas
      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.borderRadius = '50%';

      // Colores aleatorios para las partículas
      const colors = ['#4ade80', '#3b82f6', '#ec4899', '#a855f7', '#f59e0b'];
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      container.appendChild(particle);

      // Animación de las partículas con GSAP
      gsap.fromTo(
        particle,
        {
          x: '50%',
          y: '80%',
          scale: 0,
          opacity: 1
        },
        {
          x: `${50 + (Math.random() - 0.5) * 100}%`,
          y: `${30 + (Math.random() - 0.5) * 70}%`,
          scale: Math.random() * 1.5 + 0.5,
          opacity: 0,
          duration: 0.8 + Math.random() * 0.6,
          ease: 'power3.out',
          onComplete: () => {
            if (particle.parentNode) {
              particle.parentNode.removeChild(particle);
            }
          }
        }
      );
    }
  }

  // Añadir un flash de success
  const successFlash = document.createElement('div');
  successFlash.style.position = 'absolute';
  successFlash.style.inset = '0';
  successFlash.style.backgroundColor = 'rgba(74, 222, 128, 0.15)';
  successFlash.style.zIndex = '1';
  successFlash.style.borderRadius = 'inherit';

  if (container) {
    container.appendChild(successFlash);

    gsap.to(successFlash, {
      opacity: 0,
      duration: 0.7,
      onComplete: () => {
        if (successFlash.parentNode) {
          successFlash.parentNode.removeChild(successFlash);
        }
      }
    });
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

    // Animación de inicio de registro
    this.animateSuccessRegistration();

    // Simulación de registro
    setTimeout(() => {
      // En una aplicación real, aquí iría la llamada al servicio de registro
      console.log('Datos de registro:', this.registerForm.value);

      // Simulamos registro exitoso y redirigimos al login
      this.router.navigate(['/auth/login']);
    }, 1500);
  }
}
