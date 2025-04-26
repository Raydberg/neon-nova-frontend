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
    // Modificamos para que el email esté habilitado por defecto
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], // Ya no está disabled por defecto
      phone: ['', Validators.pattern(/^\+?[0-9]{8,15}$/)],
    });

    // Si es cuenta de Google, deshabilitamos el email
    this.profileForm.get('email')?.valueChanges.subscribe(() => {
      if (this.isGoogleAccount()) {
        this.profileForm.get('email')?.disable();
      }
    });
  }

  private loadUserData(): void {
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
      error: () => {
        this.isLoading.set(false);
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

    // Preparamos los datos para el envío
    const updateData: any = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      phone: this.profileForm.value.phone || undefined
    };

    // Solo incluimos el email si no es cuenta de Google y el campo está habilitado
    if (!this.isGoogleAccount() && !this.profileForm.get('email')?.disabled) {
      updateData.email = this.profileForm.value.email;
    }

    this.userService.updateProfile(updateData).subscribe({
      next: (success) => {
        if (success) {
          this.updateSuccess.set(true);
          this.isEditing.set(false);

          // Si todos los campos están deshabilitados es porque no estamos en modo edición
          if (this.profileForm.enabled) {
            this.profileForm.disable();
          }
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
        } else {
          this.updateError.set('Ocurrió un error al actualizar el perfil');
        }

        this.isSaving.set(false);
      }
    });
  }
}
