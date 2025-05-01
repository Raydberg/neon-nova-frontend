import {Component, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';
import {PasswordRequirementsComponent} from '../password-requirements/password-requirements.component';
import {PasswordStrengthIndicatorComponent} from '../password-strength-indicator/password-strength-indicator.component';

@Component({
  selector: 'register-credentials-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    PasswordRequirementsComponent,
    PasswordStrengthIndicatorComponent
  ],
  templateUrl: "./credentials-form.component.html"
})
export class CredentialsFormComponent {
  parentForm = input.required<FormGroup>();
  isPasswordVisible = input<boolean>(false);
  isConfirmPasswordVisible = input<boolean>(false);
  passwordStrength = input<'weak' | 'medium' | 'strong' | null>(null);
  passwordRequirements = input<{
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  }>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  termsAccepted = input<boolean>(false);

  togglePassword = output<void>();
  toggleConfirmPassword = output<void>();
  toggleTerms = output<void>();

  togglePasswordVisibility() {
    this.togglePassword.emit();
  }

  toggleConfirmPasswordVisibility() {
    this.toggleConfirmPassword.emit();
  }

  toggleTermsAccepted() {
    this.toggleTerms.emit();
  }
}
