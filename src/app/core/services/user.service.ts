import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '@environments/environment';
import { UserModel } from '@core/models/user-model';
import { AvatarService } from '@core/services/avatar.service';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private avatarService = inject(AvatarService);

  // Signals principales
  private readonly userProfile = signal<UserModel | null>(null);
  readonly avatarLoadError = signal(false);

  // Computed values
  readonly userName = computed(() => {
    const profile = this.userProfile();
    if (!profile) return 'Usuario';
    return profile.firstName && profile.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : 'Usuario';
  });

  readonly userInitials = computed(() => {
    const profile = this.userProfile();
    return profile?.initialAvatar || 'U';
  });

  readonly hasAvatar = computed(() => {
    return !!this.userProfile() && !this.avatarLoadError();
  });

  readonly isAdmin = computed(() => {
    return !!this.userProfile()?.isAdmin;
  });

  // Operaciones con el perfil
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

  updateProfile(updateData: UpdateProfileRequest): Observable<boolean> {
    return this.http.put<UserModel>(
      `${environment.apiUrl}/user`,
      updateData
    ).pipe(
      tap(profile => {
        if (profile) {
          const currentProfile = this.userProfile();
          const updatedProfile = {
            ...currentProfile,
            ...profile,
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

  // Métodos relacionados con el avatar
  getUserAvatar(): string | null {
    if (this.avatarLoadError()) return null;

    const profile = this.userProfile();
    if (!profile) return null;

    if (profile.avatarUrl) {
      return this.processAvatarUrl(profile.avatarUrl);
    }

    return this.avatarService.getAvatarURL(profile.initialAvatar, profile.id);
  }

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
