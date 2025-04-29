import { ChangeDetectionStrategy, Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '@core/services/auth.service';
import type { RegisterRequest } from '@core/interfaces/register-request.interface';
import { FormStepperComponent } from './form-stepper/form-stepper.component';
import { PersonalInfoFormComponent } from './personal-info-form/personal-info-form.component';
import { CredentialsFormComponent } from './credentials-form/credentials-form.component';

@Component({
  selector: 'auth-register',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LucideAngularModule,
    FormStepperComponent,
    PersonalInfoFormComponent,
    CredentialsFormComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: "./register.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  @ViewChild('formStep1', { static: false }) formStep1!: ElementRef;
  @ViewChild('formStep2', { static: false }) formStep2!: ElementRef;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  isPasswordVisible = signal(false);
  isConfirmPasswordVisible = signal(false);
  isRegistering = signal(false);
  registerError = signal<string | null>(null);
  currentStep = signal(1);
  passwordStrength = signal<'weak' | 'medium' | 'strong' | null>(null);
  termsAccepted = signal(false);
  isAnimating = signal(false);
  slideDirection = signal<'next' | 'prev'>('next');

  passwordRequirements = signal({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  registerForm!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    } as AbstractControlOptions);

    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.checkPasswordStrength(value);
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

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

  togglePasswordVisibility() {
    this.isPasswordVisible.update(state => !state);
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible.update(state => !state);
  }

  toggleTermsAccepted() {
    this.termsAccepted.update(state => !state);
    this.registerForm.patchValue({ termsAccepted: this.termsAccepted() });
  }

  nextStep() {
    if (this.isAnimating()) return;

    const currentStep = this.currentStep();

    if (currentStep === 1) {
      const step1Fields = ['firstName', 'lastName', 'email', 'phone'];
      const isStep1Valid = step1Fields.every(field =>
        !this.registerForm.get(field)?.invalid || field === 'phone');

      if (!isStep1Valid) {
        step1Fields.forEach(field => this.registerForm.get(field)?.markAsTouched());
        return;
      }

      this.isAnimating.set(true);
      this.slideDirection.set('next');

      setTimeout(() => {
        this.currentStep.set(currentStep + 1);
        setTimeout(() => {
          this.isAnimating.set(false);
        }, 500);
      }, 300);
    }
  }

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

  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isRegistering.set(true);
    this.registerError.set(null);

    const formData = this.registerForm.value;
    const registerData: RegisterRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || '',
      password: formData.password
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        setTimeout(() => {
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        }, 1000);
      },
      error: (error) => {
        let errorMsg = 'Ha ocurrido un error al registrarse.';

        if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (error?.status === 409) {
          errorMsg = 'Este correo electrónico ya está registrado.';
        }

        this.handleRegistrationError(errorMsg);
      }
    });
  }

  private handleRegistrationError(message: string) {
    this.registerError.set(message);
    this.isRegistering.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
