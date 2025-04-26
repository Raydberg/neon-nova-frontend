import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { UserProfile } from '@core/models/user-profile.model';

@Component({
  selector: 'user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  userService = inject(UserService);
  authService = inject(AuthService);

  isLoading = signal(true);
  isEditing = signal(false);
  updateSuccess = signal(false);
  updateError = signal<string | null>(null);
  isSaving = signal(false);

  isGoogleAccount = signal(false);
  profileForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadUserData();

    const provider = this.authService.user()?.provider;
    const localProvider = localStorage.getItem('auth_provider');

    const isGoogle = provider === 'google' || localProvider === 'google';

    this.isGoogleAccount.set(isGoogle);
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern(/^\+?[0-9]{8,15}$/)]
    });
  }

  private loadUserData(): void {
    this.isLoading.set(true);
    this.userService.fetchCurrentUser().subscribe({
      next: (success) => {
        if (success) {
          const profile = this.userService.getUserProfile();

          if (profile()) {
            this.profileForm.patchValue({
              firstName: profile()?.firstName,
              lastName: profile()?.lastName,
              email: profile()?.email,
              phone: profile()?.phone || ''
            });

            // Deshabilitamos el campo email solo si es una cuenta de Google
            if (this.isGoogleAccount()) {
              this.profileForm.get('email')?.disable();
            } else if (!this.isEditing()) {
              // Si no estamos en modo edición, deshabilitamos todos los campos
              this.profileForm.disable();
            }
          }
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
        this.isLoading.set(false);
        this.updateError.set('No se pudieron cargar tus datos. Por favor, intenta nuevamente.');
      }
    });
  }

  toggleEdit(): void {
    this.isEditing.update(value => !value);

    if (this.isEditing()) {
      // Activamos todos los controles excepto el email si es cuenta de Google
      this.profileForm.enable();
      if (this.isGoogleAccount()) {
        this.profileForm.get('email')?.disable();
      }
    } else {
      // Si salimos del modo edición, cargamos los datos de nuevo y deshabilitamos todo
      this.loadUserData();
    }

    this.updateSuccess.set(false);
    this.updateError.set(null);
  }

  saveChanges(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.updateError.set(null);

    // Preparamos los datos para el envío
    const updateData: any = {};

    // Solo incluimos los campos que han cambiado
    const profile = this.userService.getUserProfile();

    const formValue = this.profileForm.value;
    if (formValue.firstName !== profile()?.firstName) {
      updateData.firstName = formValue.firstName;
    }

    if (formValue.lastName !== profile()?.lastName) {
      updateData.lastName = formValue.lastName;
    }

    // Solo incluir el email si:
    // 1. No es cuenta de Google
    // 2. El campo está habilitado
    // 3. El valor ha cambiado
    if (!this.isGoogleAccount() &&
        !this.profileForm.get('email')?.disabled &&
        formValue.email !== profile()?.email) {
      updateData.email = formValue.email;
    }

    // Solo incluir el teléfono si ha cambiado
    const currentPhone = profile()?.phone || '';
    if (formValue.phone !== currentPhone) {
      updateData.phone = formValue.phone || null; // Enviamos null si está vacío
    }

    // Si no hay cambios, no hacemos la petición
    if (Object.keys(updateData).length === 0) {
      this.isSaving.set(false);
      this.isEditing.set(false);
      this.updateSuccess.set(true);
      this.profileForm.disable();
      setTimeout(() => this.updateSuccess.set(false), 3000);
      return;
    }

    this.userService.updateProfile(updateData).subscribe({
      next: (success) => {
        if (success) {
          this.updateSuccess.set(true);
          this.isEditing.set(false);
          this.profileForm.disable();

          setTimeout(() => {
            this.updateSuccess.set(false);
          }, 3000);
        } else {
          this.updateError.set('No se pudieron guardar los cambios');
        }
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('Error updating profile:', error);

        // Mensajes de error más específicos
        if (error?.error?.message) {
          this.updateError.set(error.error.message);
        } else if (error?.status === 409) {
          this.updateError.set('Este correo electrónico ya está en uso');
        } else if (error?.status === 401) {
          this.updateError.set('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          setTimeout(() => {
            this.authService.logout();
          }, 2000);
        } else {
          this.updateError.set('Ocurrió un error al actualizar el perfil');
        }

        this.isSaving.set(false);
      }
    });
  }
}
