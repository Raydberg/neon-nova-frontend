import { Injectable, inject, signal, computed } from '@angular/core';
import { UserService, UpdateProfileRequest } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { Observable } from 'rxjs';

interface ProfileDisplayData {
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  // Estado de UI
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly updateSuccess = signal(false);
  readonly updateError = signal<string | null>(null);

  // Datos de visualización del perfil para reactividad inmediata en la UI
  readonly profileData = signal<ProfileDisplayData>({
    name: '',
    email: '',
    avatarUrl: null,
    initials: '',
    phone: ''
  });

  // Valores calculados
  readonly isGoogleAccount = computed(() => this.authService.isGoogleUser());

  // Métodos públicos
  updateProfileData(): void {
    const profile = this.userService.getUserProfile()();
    if (!profile) return;

    this.profileData.set({
      name: this.userService.userName(),
      email: profile.email || '',
      avatarUrl: this.userService.getUserAvatar(),
      initials: this.userService.userInitials(),
      phone: profile.phone || ''
    });
  }

  saveProfile(updateData: UpdateProfileRequest): Observable<boolean> {
    this.isSaving.set(true);
    this.updateError.set(null);

    // Actualizar UI optimistamente si hay cambio de nombre
    if (updateData.firstName || updateData.lastName) {
      const currentProfile = this.userService.getUserProfile()();
      if (currentProfile) {
        const firstName = updateData.firstName || currentProfile.firstName;
        const lastName = updateData.lastName || currentProfile.lastName;
        this.profileData.update(data => ({
          ...data,
          name: `${firstName} ${lastName}`
        }));
      }
    }

    return this.userService.updateProfile(updateData);
  }

  setUpdateSuccess(): void {
    this.updateSuccess.set(true);
    setTimeout(() => this.updateSuccess.set(false), 3000);
  }

  setUpdateError(message: string): void {
    this.updateError.set(message);
  }

  clearUpdateStatus(): void {
    this.updateSuccess.set(false);
    this.updateError.set(null);
  }

  handleAvatarError(): void {
    this.profileData.update(data => ({
      ...data,
      avatarUrl: null
    }));

    this.userService.setAvatarLoadError();
  }

  // Métodos para obtener valores de avatar/imagen específicos
  displayHasAvatar(): boolean {
    return !!this.profileData().avatarUrl && !this.userService.avatarLoadError();
  }

  getDisplayAvatar(): string | null {
    if (this.userService.avatarLoadError()) return null;

    const avatarUrl = this.profileData().avatarUrl;
    if (avatarUrl) {
      return this.userService.processAvatarUrl(avatarUrl) || this.userService.getUserAvatar();
    }

    return this.userService.getUserAvatar();
  }
}
