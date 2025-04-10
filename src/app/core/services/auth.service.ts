import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import {  catchError, map, Observable, of, tap } from 'rxjs';
import {LoginRequest} from '@modules/auth/interfaces/login-request.interface';
import {environment} from '@environments/environment';
import {AuthResponse} from '@modules/auth/interfaces/auth-response.interface';
import {DecodedToken} from '@modules/auth/interfaces/decoded-token.interface';




@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Estado de autenticación usando señales
  private readonly authState = signal<{
    token: string | null;
    user: DecodedToken | null;
    isLoggedIn: boolean;
  }>({
    token: this.getTokenFromStorage(),
    user: this.getUserFromToken(),
    isLoggedIn: this.hasValidToken()
  });

  // Señales computadas para acceder al estado
  readonly token = computed(() => this.authState().token);
  readonly user = computed(() => this.authState().user);
  readonly isLoggedIn = computed(() => this.authState().isLoggedIn);
  readonly isAdmin = computed(() => this.authState().user?.isAdmin === 'true');

  constructor() {
    // Iniciar el token si existe en localStorage
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

  logout(): void {
    localStorage.removeItem('auth_token');
    this.authState.set({ token: null, user: null, isLoggedIn: false });
    this.router.navigate(['/auth/login']);
  }

  private handleAuthResponse(response: AuthResponse): void {
    const { token } = response;

    // Guardar token en localStorage
    localStorage.setItem('auth_token', token);

    // Decodificar y guardar usuario
    const user = this.decodeToken(token);

    // Actualizar estado de autenticación
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

    // Verificar si el token ha expirado
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
