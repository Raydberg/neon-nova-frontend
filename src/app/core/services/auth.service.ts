import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { LoginRequest } from '@modules/auth/interfaces/login-request.interface';
import { environment } from '@environments/environment';
import { AuthResponse } from '@modules/auth/interfaces/auth-response.interface';
import { DecodedToken } from '@modules/auth/interfaces/decoded-token.interface';
import {RegisterRequest} from '@core/interfaces/register-request.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly authState = signal<{
    token: string | null;
    user: DecodedToken | null;
    isLoggedIn: boolean;
  }>({
    token: this.getTokenFromStorage(),
    user: this.getUserFromToken(),
    isLoggedIn: this.hasValidToken()
  });

  readonly token = computed(() => this.authState().token);
  readonly user = computed(() => this.authState().user);
  readonly isLoggedIn = computed(() => this.authState().isLoggedIn);
  readonly isAdmin = computed(() => this.authState().user?.isAdmin === 'true');

  constructor() {
    if (this.token()) {
      this.validateTokenExpiration();
    }
  }

  login(credentials: LoginRequest): Observable<boolean> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      }),
      map(() => true),
      catchError(error => {
        console.error('Error en login:', error);
        return of(false);
      })
    );
  }

  register(userData: RegisterRequest): Observable<boolean> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error en registro:', error);
        return of(false);
      })
    );
  }

  handleGoogleCallback(token: string): boolean {
    if (!token) return false;

    try {
      const response: AuthResponse = {
        token,
        expired: new Date(Date.now() + 3600 * 1000).toISOString()
      };
      this.handleAuthResponse(response);
      return true;
    } catch (error) {
      console.error('Error processing Google authentication:', error);
      return false;
    }
  }

  loginWithGoogle(): void {
    const callbackUrl = `${environment.apiClientUrl}/auth/google-callback`;
    window.location.href = `${environment.apiUrl}/auth/login/google?returnUrl=${encodeURIComponent(callbackUrl)}`;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.authState.set({ token: null, user: null, isLoggedIn: false });
    this.router.navigate(['/auth/login']);
  }

  private handleAuthResponse(response: AuthResponse): void {
    const { token } = response;

    localStorage.setItem('auth_token', token);

    const user = this.decodeToken(token);

    this.authState.set({
      token,
      user,
      isLoggedIn: true
    });
  }

  private decodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getUserFromToken(): DecodedToken | null {
    const token = this.getTokenFromStorage();
    return token ? this.decodeToken(token) : null;
  }

  private hasValidToken(): boolean {
    const token = this.getTokenFromStorage();
    if (!token) return false;

    const decodedToken = this.decodeToken(token);
    if (!decodedToken) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp > currentTime;
  }

  private validateTokenExpiration(): void {
    const user = this.user();
    if (!user) {
      this.logout();
      return;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (user.exp <= currentTime) {
      this.logout();
    }
  }
}
