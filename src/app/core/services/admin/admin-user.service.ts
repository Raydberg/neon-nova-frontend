import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {Observable, switchMap} from 'rxjs';
import {map} from 'rxjs/operators';
import {UserModel} from '@core/models/user-model';
import {UserService} from '@core/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/user`;
  private authUrl = `${environment.apiUrl}/auth`;
  private userService = inject(UserService);

  // Método para procesar URLs de avatares (reutilizando lógica de UserService)
  processAvatarUrl(avatarUrl: string | undefined): string | null {
    return this.userService.processAvatarUrl(avatarUrl);
  }

  isGoogleUser(user: UserModel): boolean {
    return user.isGoogleAccount === true;
  }

  private parseUserDates(users: UserModel[]): UserModel[] {
    return users.map(user => this.parseUserDate(user));
  }

  getUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(this.apiUrl)
      .pipe(
        map(users => this.parseUserDates(users))
      );
  }

  getUserById(userId: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.apiUrl}/${userId}`)
      .pipe(
        map(user => this.parseUserDate(user))
      );
  }

  createUser(userData: any): Observable<UserModel> {
    return this.http.post<UserModel>(this.apiUrl, userData)
      .pipe(
        map(user => this.parseUserDate(user))
      );
  }

  updateUser(userId: string, userData: any): Observable<UserModel> {
    // Verificar si hay una copia almacenada del usuario antes de actualizar
    return this.getUserById(userId).pipe(
      switchMap(existingUser => {
        // Si el usuario es de Google y se está intentando cambiar el email, quitarlo
        if (this.isGoogleUser(existingUser) && userData.email) {
          // Crear una copia para no modificar el objeto original
          const updatedData = { ...userData };
          delete updatedData.email;

          return this.http.put<UserModel>(`${this.apiUrl}/${userId}`, updatedData);
        }

        // Si no es usuario de Google o no incluye email, enviar datos originales
        return this.http.put<UserModel>(`${this.apiUrl}/${userId}`, userData);
      }),
      map(user => this.parseUserDate(user))
    );
  }
  setUserStatus(userId: string, isEnabled: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/status`, {isEnabled});
  }

  setUserAdminStatus(userId: string, isAdmin: boolean): Observable<any> {
    return this.http.put(`${this.authUrl}/admin-status`, {userId, isAdmin});
  }

  setUserActiveStatus(userId: string, isActive: boolean): Observable<any> {
    return this.setUserStatus(userId, isActive);
  }

  private parseUserDate(user: UserModel): UserModel {
    return {
      ...user,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
    };
  }
}
