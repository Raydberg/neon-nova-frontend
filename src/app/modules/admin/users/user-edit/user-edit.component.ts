import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AdminUserService } from '@core/services/admin/admin-user.service';
import { UserModel } from '@core/models/user-model';
import { finalize, switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import {environment} from '@environments/environment';
import { AvatarService } from '@core/services/avatar.service';
import { NotificationService } from '@core/services/notification.service';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  active: boolean;
  role: 'admin' | 'customer' | 'staff';
  lastLogin?: Date;
  createdAt: Date;
  avatarUrl?: string;
  initialAvatar: string;
  isGoogleUser: boolean;
}

@Component({
  selector: 'admin-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './user-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-slide-in {
      animation: slideIn 0.5s ease forwards;
    }

    .form-section {
      animation: slideIn 0.5s ease forwards;
    }

    .form-section:nth-child(1) { animation-delay: 0.1s; }
    .form-section:nth-child(2) { animation-delay: 0.2s; }
    .form-section:nth-child(3) { animation-delay: 0.3s; }
    .form-section:nth-child(4) { animation-delay: 0.4s; }

    .field-error {
      max-height: 0;
      opacity: 0;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .field-error.visible {
      max-height: 60px;
      opacity: 1;
      margin-top: 0.25rem;
    }

    .btn-save {
      transition: transform 0.2s ease;
    }

    .btn-save:hover {
      transform: translateY(-2px);
    }

    .btn-save:active {
      transform: translateY(0);
    }
  `]
})
export class UserEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(AdminUserService);
  private avatarService = inject(AvatarService);
  private notificationService = inject(NotificationService);

  avatarLoadError = signal<boolean>(false);
  // UI state
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isTogglingStatus = signal<boolean>(false);
  isNewUser = signal<boolean>(false);
  isChangingAdminStatus = signal<boolean>(false);
  // Form state
  userForm!: FormGroup;

  // User data
  userId = signal<string | null>(null);
  user = signal<User | null>(null);

  ngOnInit() {
    this.initForm();

    // Get the user ID from the route params
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id === 'create') {
        this.isNewUser.set(true);
        this.isLoading.set(false);
      } else if (id) {
        this.userId.set(id);
        this.loadUser(id);
      } else {
        // Redirigir a la lista de usuarios si no hay ID
        this.router.navigate(['/admin/users']);
      }
    });
  }

  toggleAdminStatus() {
    // Skip for new users
    if (!this.userId() || this.isNewUser()) {
      return;
    }

    const isAdmin = this.userForm.get('role')?.value === 'admin';
    const userId = this.userId()!;

    // Disable the control during the API request
    this.isChangingAdminStatus.set(true);
    this.userForm.get('role')?.disable();

    // Call the API with the new method
    this.userService.setUserAdminStatus(userId, isAdmin)
      .pipe(finalize(() => {
        this.isChangingAdminStatus.set(false);
        this.userForm.get('role')?.enable(); // Re-enable the control
      }))
      .subscribe({
        next: () => {
          if (this.user()) {
            // Utilizar una conversión explícita para asegurar que el tipo sea correcto
            const newRole = isAdmin ? 'admin' as const : 'customer' as const;
            const updatedUser = {...this.user()!, role: newRole};
            this.user.set(updatedUser);
          }

          // Mostramos notificación usando NotificationService
          this.notificationService.success(isAdmin
            ? 'Usuario promovido a administrador correctamente'
            : 'Permisos de administrador revocados correctamente'
          );

          // Si venimos de onSubmit, redirigir después de un breve retraso
          if (this.isSaving()) {
            setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 1500);
          }
        },
        error: (err) => {
          console.error('Error cambiando permisos de administrador:', err);
          // Revert the form value
          const previousRole = isAdmin ? 'customer' : 'admin';
          this.userForm.get('role')?.setValue(previousRole);
          if (this.user()) {
            // También aquí usamos una conversión explícita
            const prevRole = previousRole as 'admin' | 'customer' | 'staff';
            const revertedUser = {...this.user()!, role: prevRole};
            this.user.set(revertedUser);
          }

          // Mostramos notificación de error
          this.notificationService.error('No se pudo cambiar los permisos de administrador. Intente nuevamente.');
        }
      });
  }

  private initForm() {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      role: ['customer', Validators.required],
      active: [true]
    });
  }

  private loadUser(id: string) {
    this.isLoading.set(true);

    this.userService.getUserById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (apiUser) => {
          // Determinar si es un usuario de Google usando isGoogleAccount
          const isGoogleUser = apiUser.isGoogleAccount === true || this.userService.isGoogleUser(apiUser);

          // Convertir el usuario de la API al formato del componente
          const user: User = {
            id: apiUser.id,
            firstName: apiUser.firstName,
            lastName: apiUser.lastName,
            email: apiUser.email,
            active: apiUser.isActive,
            phoneNumber:apiUser.phone,
            role: apiUser.isAdmin ? 'admin' : 'customer',
            lastLogin: apiUser.lastLogin ? new Date(apiUser.lastLogin) : undefined,
            createdAt: new Date(apiUser.createdAt || new Date()),
            avatarUrl: apiUser.avatarUrl,
            initialAvatar: apiUser.initialAvatar || `${apiUser.firstName[0]}${apiUser.lastName[0]}`,
            isGoogleUser: isGoogleUser
          };

          this.user.set(user);
          this.populateForm(user);

          // Si es un usuario de Google, deshabilitar el campo de correo
          if (isGoogleUser) {
            this.userForm.get('email')?.disable();
          }
        },
        error: (err) => {
          console.error('Error cargando usuario:', err);
          this.notificationService.error('No se pudo cargar la información del usuario. Por favor, intenta nuevamente.');
        }
      });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.isSaving.set(true);

    // Preparar datos para enviar
    const userData: any = {
      firstName: this.userForm.value.firstName,
      lastName: this.userForm.value.lastName,
      phone: this.userForm.value.phoneNumber || null,
      isActive: this.userForm.value.active
    };

    // Solo incluir el email si no es un usuario de Google y el campo no está deshabilitado
    if (!this.user()?.isGoogleUser && !this.userForm.get('email')?.disabled) {
      userData.email = this.userForm.value.email;
    }

    // Determinar si es crear o actualizar
    const request = this.isNewUser()
      ? this.userService.createUser(userData)
      : this.userService.updateUser(this.userId()!, userData);

    request.pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updatedUser) => {
          // Si necesitamos actualizar el rol de administrador por separado
          if (!this.isNewUser() &&
              this.user() &&
              this.user()!.role !== this.userForm.value.role) {
            this.toggleAdminStatus();
          } else {
            // Mostrar notificación de éxito
            this.notificationService.success(this.isNewUser() ?
              'Usuario creado correctamente' :
              'Usuario actualizado correctamente'
            );

            // Redirigir después de un breve retraso
            setTimeout(() => {
              this.router.navigate(['/admin/users']);
            }, 1500);
          }
        },
        error: (err) => {
          console.error('Error guardando usuario:', err);
          let errorMsg = 'No se pudo guardar el usuario.';

          if (err.error?.message) {
            errorMsg = err.error.message;
          } else if (err.status === 409) {
            errorMsg = 'Ya existe un usuario con ese correo electrónico.';
          }

          this.notificationService.error(errorMsg + ' Por favor, intenta nuevamente.');
        }
      });
  }

  hasAvatar(): boolean {
    return !!this.user()?.avatarUrl && !this.avatarLoadError();
  }

  getUserAvatar(): string | null {
    if (this.avatarLoadError()) return null;

    const user = this.user();
    if (!user) return null;

    if (user.avatarUrl) {
      return this.avatarService.processAvatarUrl(user.avatarUrl);
    } else if (user.initialAvatar) {
      // Si no hay avatarUrl pero sí hay initialAvatar, generar avatar con iniciales
      return this.avatarService.getAvatarURL(user.initialAvatar, user.id);
    }

    return null;
  }

  onAvatarError(): void {
    this.avatarLoadError.set(true);
  }

  getUserInitials(): string {
    const user = this.user();
    if (!user) return 'U';

    return user.initialAvatar ||
           `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase();
  }

  private populateForm(user: User) {
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      active: user.active
    });
  }

  toggleActiveStatus() {
    // Skip for new users
    if (!this.userId() || this.isNewUser()) {
      return;
    }

    const newStatus = this.userForm.get('active')?.value;
    const userId = this.userId()!;

    // Disable the control during the API request
    this.isTogglingStatus.set(true);
    this.userForm.get('active')?.disable();

    // Call the API with the new method
    this.userService.setUserStatus(userId, newStatus)
      .pipe(finalize(() => {
        this.isTogglingStatus.set(false);
        this.userForm.get('active')?.enable(); // Re-enable the control
      }))
      .subscribe({
        next: () => {
          if (this.user()) {
            const updatedUser = { ...this.user()!, active: newStatus };
            this.user.set(updatedUser);
          }

          // Usamos NotificationService
          this.notificationService.success(newStatus
            ? 'Usuario activado correctamente'
            : 'Usuario desactivado correctamente'
          );
        },
        error: (err) => {
          console.error('Error cambiando estado del usuario:', err);
          // Revert the form value (not changing disabled state)
          this.userForm.get('active')?.setValue(!newStatus);
          if (this.user()) {
            const revertedUser = { ...this.user()!, active: !newStatus };
            this.user.set(revertedUser);
          }

          // Mostrar notificación de error
          this.notificationService.error('No se pudo cambiar el estado del usuario. Intente nuevamente.');
        }
      });
  }

  getAvatarBackgroundColor(): string {
    const user = this.user();
    if (!user) return '';

    return this.avatarService.getAvatarBackgroundColor(user.id);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  hasError(controlName: string, errorName: string) {
    const control = this.userForm.get(controlName);
    return control?.touched && control?.hasError(errorName);
  }

  resetForm() {
    if (this.user()) {
      this.populateForm(this.user()!);
      this.notificationService.info('Formulario restablecido');
    } else {
      this.userForm.reset({
        role: 'customer',
        active: true
      });
      this.notificationService.info('Formulario limpiado');
    }
  }

  // Helper methods for UI
  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'staff': return 'Personal';
      case 'customer': return 'Cliente';
      default: return role;
    }
  }

  getStatusLabel(active: boolean): string {
    return active ? 'Activo' : 'Inactivo';
  }

  // Helper method para formatear fechas de manera segura
  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    try {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      console.error('Error al formatear fecha:', e);
      return 'Fecha inválida';
    }
  }
}
