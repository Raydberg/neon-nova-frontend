import {ChangeDetectionStrategy, Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';
import {UserService} from '@core/services/user.service';
import {AuthService} from '@core/services/auth.service';

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

  // Guardar una copia local del perfil para mostrar durante actualizaciones
  profileData = signal<{
    name: string;
    email: string;
    avatarUrl: string | null;
    initials: string;
  }>({
    name: '',
    email: '',
    avatarUrl: null,
    initials: ''
  });

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
            // Procesar correctamente la URL del avatar
            const avatarUrl = profile()?.avatarUrl;
            const processedAvatarUrl = this.userService.processAvatarUrl(avatarUrl);

            // Guardar copia local del perfil con la URL procesada
            this.profileData.set({
              name: this.userService.getUserName(),
              email: profile()?.email || '',
              avatarUrl: this.userService.getUserAvatar(),
              initials: profile()?.initialAvatar || this.userService.getUserInitials()
            });

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

  onAvatarError(): void {
    // Marcamos localmente que hay un error con el avatar
    this.profileData.update(data => ({
      ...data,
      avatarUrl: null
    }));

    // También lo marcamos en el servicio
    this.userService.setAvatarLoadError();
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

    // Actualizar de forma optimista la UI con los datos que estamos enviando
    // para evitar la sensación de información que desaparece
    const currentProfileData = this.profileData();
    this.profileData.set({
      ...currentProfileData,
      name: `${formValue.firstName} ${formValue.lastName}`
    });

    this.userService.updateProfile(updateData).subscribe({
      next: (success) => {
        if (success) {
          // Actualizar la copia local del perfil basado en el perfil actualizado
          const updatedProfile = this.userService.getUserProfile();
          this.profileData.set({
            name: this.userService.getUserName(),
            email: updatedProfile()?.email || currentProfileData.email,
            avatarUrl: this.userService.getUserAvatar(),
            initials: updatedProfile()?.initialAvatar || this.userService.getUserInitials()
          });

          this.updateSuccess.set(true);
          this.isEditing.set(false);
          this.profileForm.disable();

          setTimeout(() => {
            this.updateSuccess.set(false);
          }, 3000);
        } else {
          this.updateError.set('No se pudieron guardar los cambios');
          // Restaurar datos si la actualización falló
          this.loadUserData();
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

        // Restaurar datos si la actualización falló
        this.loadUserData();
        this.isSaving.set(false);
      }
    });
  }

  // Devuelve el nombre guardado localmente para evitar parpadeos
  getDisplayInitials(): string {
    const profile = this.userService.getUserProfile()();

    // Si tenemos un perfil, usar siempre initialAvatar que viene del backend
    if (profile) {
      return profile.initialAvatar;
    }

    // Como fallback, usar las iniciales guardadas en profileData
    return this.profileData().initials || 'U';
  }

  // Devuelve el avatar guardado localmente para evitar parpadeos
  getDisplayAvatar(): string | null {
    // Si ya tenemos un error de carga de avatar, devolvemos null
    if (this.userService.avatarLoadError()) return null;

    // Usar profileData primero, pero pasar por processAvatarUrl para asegurar que la URL sea correcta
    const avatarUrl = this.profileData().avatarUrl;
    if (avatarUrl) {
      return this.userService.processAvatarUrl(avatarUrl) || this.userService.getUserAvatar();
    }

    return this.userService.getUserAvatar();
  }

  getDisplayName(): string {
    // Primero intenta usar el nombre almacenado en profileData para evitar parpadeos
    if (this.profileData().name) {
      return this.profileData().name;
    }

    // Si no hay datos en profileData, intenta obtenerlo del servicio
    const profile = this.userService.getUserProfile()();
    if (profile) {
      if (profile.firstName && profile.lastName) {
        return `${profile.firstName} ${profile.lastName}`;
      }
    }

    // Si todo lo demás falla, devuelve un valor por defecto
    return 'Usuario';
  }


  // Comprueba si hay avatar usando el valor local
  displayHasAvatar(): boolean {
    // El problema aquí es que estamos accediendo a userService.avatarLoadError como propiedad
    // pero es un signal, necesitamos usar los paréntesis para obtener su valor
    return !!this.profileData().avatarUrl && !this.userService.avatarLoadError();
  }
}
