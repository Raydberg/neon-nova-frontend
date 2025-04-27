import {HttpClient} from '@angular/common/http';
import {inject, Injectable, signal} from '@angular/core';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {environment} from '@environments/environment';
import {UserModel} from '@core/models/user-model';
import {AvatarService} from '@core/services/avatar.service';

// Interface para la solicitud de actualización de perfil
interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly userProfile = signal<UserModel | null>(null);
  private avatarService = inject(AvatarService);
  avatarLoadError = signal(false);

  getUserProfile() {
    return this.userProfile;
  }

  fetchCurrentUser(): Observable<boolean> {
    return this.http.get<UserModel>(`${environment.apiUrl}/user/current`).pipe(
      tap(profile => {
        this.userProfile.set(profile);
        this.clearAvatarLoadError();
      }),
      map(() => true),
      catchError(error => {
        console.error('Error loading user profile:', error);
        return of(false);
      })
    );
  }

  // Método actualizado para actualizar el perfil del usuario
  updateProfile(updateData: UpdateProfileRequest): Observable<boolean> {
    return this.http.put<UserModel>(
      `${environment.apiUrl}/user`,
      updateData
    ).pipe(
      tap(profile => {
        // Actualizamos el perfil en el estado local
        if (profile) {
          // Fusionamos los datos actuales del perfil con la respuesta para preservar campos que la API no devuelve
          const currentProfile = this.userProfile();
          const updatedProfile = {
            ...currentProfile,
            ...profile,
            // Asegurar que se preserven datos críticos de Google Auth
            avatarUrl: profile.avatarUrl || currentProfile?.avatarUrl,
            initialAvatar: profile.initialAvatar || currentProfile!.initialAvatar,
          };

          this.userProfile.set(updatedProfile);
        }
      }),
      map(() => true),
      catchError(error => {
        console.error('Error updating profile:', error);
        return of(false);
      })
    );
  }

  clearUserProfile(): void {
    this.userProfile.set(null);
  }

  getUserName(): string {
    // Mejorar para construir el nombre completo desde firstName y lastName
    const profile = this.userProfile();
    if (!profile) return 'Usuario';

    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }

    return 'Usuario';
  }

  getUserAvatar(): string | null {
    if (this.avatarLoadError()) return null;

    const profile = this.userProfile();
    if (!profile) return null;

    // Si tiene URL de avatar, intentar utilizarla
    if (profile.avatarUrl) {
      return this.processAvatarUrl(profile.avatarUrl);
    }

    // Si no tiene URL pero sí iniciales (que siempre vienen del backend), generar avatar
    return this.avatarService.getAvatarURL(profile.initialAvatar, profile.id);
  }

  hasAvatar(): boolean {
    const profile = this.userProfile();
    // Considerar que tiene avatar si tiene URL o iniciales
    return !!profile && !this.avatarLoadError();
  }

  // Nueva función para obtener las iniciales del usuario
  getUserInitials(): string {
    const profile = this.userProfile();
    if (!profile) return 'U';

    // Usar siempre initialAvatar que viene del backend
    return profile.initialAvatar;
  }

  // Nueva función para obtener el color de fondo del avatar
  getAvatarBackground(): string {
    const profile = this.userProfile();
    if (!profile) return '';

    return this.avatarService.getAvatarBackgroundColor(profile.id);
  }

  setAvatarLoadError(): void {
    this.avatarLoadError.set(true);
  }

  clearAvatarLoadError(): void {
    this.avatarLoadError.set(false);
  }

  isAdmin(): boolean {
    return !!this.userProfile()?.isAdmin;
  }

  processAvatarUrl(avatarUrl: string | undefined): string | null {
    if (!avatarUrl) return null;

    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }

    if (avatarUrl.startsWith('/api/')) {
      const baseUrl = environment.apiUrl.endsWith('/api')
        ? environment.apiUrl.substring(0, environment.apiUrl.length - 4)
        : environment.apiUrl;

      return `${baseUrl}${avatarUrl}`;
    }

    if (avatarUrl.startsWith('/')) {
      return `${environment.apiUrl}${avatarUrl}`;
    }

    return avatarUrl;
  }
}
