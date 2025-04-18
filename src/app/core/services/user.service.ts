import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import type { UserProfile } from '../models/user-profile.model';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient)
  private readonly userProfile = signal<UserProfile | null>(null)
  private avatarLoadError = signal(false);
  getUserProfile() {
    return this.userProfile;
  }

  fetchCurrentUser(): Observable<boolean> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/user/current`).pipe(
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


  clearUserProfile(): void {
    this.userProfile.set(null);
  }


  getUserName(): string {
    return this.userProfile()?.name || 'Usuario';
  }
  getUserAvatar(): string | null {
    if (this.avatarLoadError()) return null;

    const avatarUrl = this.userProfile()?.avatarUrl;
    if (!avatarUrl) return null;

    // Si es una URL completa (http:// o https://), devolverla tal cual
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }

    // Si comienza con /api/, solo añadir la base URL sin la parte /api
    if (avatarUrl.startsWith('/api/')) {
      // Extraer la base URL sin incluir el posible /api al final
      const baseUrl = environment.apiUrl.endsWith('/api')
        ? environment.apiUrl.substring(0, environment.apiUrl.length - 4)
        : environment.apiUrl;

      return `${baseUrl}${avatarUrl}`;
    }

    // Para otras rutas relativas, añadir la URL base completa
    if (avatarUrl.startsWith('/')) {
      return `${environment.apiUrl}${avatarUrl}`;
    }

    // Caso por defecto
    return avatarUrl;
  }
  hasAvatar(): boolean {
    // Consideramos que tiene avatar si existe la URL y no ha habido errores de carga
    return !!this.userProfile()?.avatarUrl && !this.avatarLoadError();
  }
  getUserInitials(): string {
    const name = this.userProfile()?.name;
    if (!name) return 'U';

    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return parts[0].substring(0, 2).toUpperCase();
  }

  setAvatarLoadError(): void {
    this.avatarLoadError.set(true);
  }
  clearAvatarLoadError(): void {
    this.avatarLoadError.set(false);
  }
  isAdmin(): boolean {
    return !!this.userProfile()?.permission?.admin;
  }
}
