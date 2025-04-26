import {HttpClient} from '@angular/common/http';
import {inject, Injectable, signal} from '@angular/core';
import type {UserProfile} from '../models/user-profile.model';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {environment} from '@environments/environment';

interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  email?:string;
}

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

  updateProfile(updateData: UpdateProfileRequest): Observable<boolean> {
    return this.http.patch<UserProfile>(
      `${environment.apiUrl}/user`,
      updateData
    ).pipe(
      tap(profile => {
        this.userProfile.set(profile);
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
    return this.userProfile()?.name || 'Usuario';
  }

  getUserAvatar(): string | null {
    if (this.avatarLoadError()) return null;

    const avatarUrl = this.userProfile()?.avatarUrl;
    return this.processAvatarUrl(avatarUrl);
  }

  hasAvatar(): boolean {
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
