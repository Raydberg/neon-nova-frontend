import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {Observable, switchMap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {UserModel} from '@core/models/user-model';
import {UserService} from '@core/services/user.service';
import {AvatarService} from '@core/services/avatar.service';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/user`;
  private authUrl = `${environment.apiUrl}/auth`;
  private userService = inject(UserService);
  private avatarService = inject(AvatarService);

  processAvatarUrl(avatarUrl: string | undefined): string | null {
    return this.avatarService.processAvatarUrl(avatarUrl);
  }

  // Método para obtener clases de color para un avatar basado en ID
  getAvatarBackgroundColor(userId: string): string {
    return this.avatarService.getAvatarBackgroundColor(userId);
  }

  // Método para generar una URL de avatar con iniciales
  getAvatarURL(initials: string, userId: string): string {
    return this.avatarService.getAvatarURL(initials, userId);
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

          return this.http.put<UserModel>(`${this.apiUrl}/admin/${userId}`, updatedData);
        }

        // Si no es usuario de Google o no incluye email, enviar datos originales
        return this.http.put<UserModel>(`${this.apiUrl}/admin/${userId}`, userData);
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

  /**
   * Elimina un usuario por su ID
   * @param userId ID del usuario a eliminar
   * @returns Observable con la respuesta de la API
   */
  deleteUser(userId: string): Observable<any> {
    if (!userId) {
      return throwError(() => new Error('ID de usuario inválido'));
    }

    return this.http.delete(`${this.apiUrl}/${userId}`).pipe(
      catchError(error => {
        console.error(`Error al eliminar usuario con ID ${userId}:`, error);

        // Crear un mensaje de error más descriptivo
        let errorMessage = 'Error al eliminar el usuario';

        if (error.status === 404) {
          errorMessage = 'El usuario no existe o ya ha sido eliminado';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para eliminar este usuario';
        } else if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
        } else if (error.status === 400) {
          errorMessage = 'No se puede eliminar el usuario. Verifica que no tenga recursos asociados';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private parseUserDate(user: UserModel): UserModel {
    return {
      ...user,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
    };
  }
}
