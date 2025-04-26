import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserModel } from '@core/models/user-model';
import {UserService} from '@core/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/user`;
  private authUrl = `${environment.apiUrl}/auth`;
  private userService = inject(UserService)
  processAvatarUrl(avatarUrl: string | undefined): string | null {
    // Utilizar el método del UserService para procesar URLs de avatares
    // Simulamos el objeto userProfile con la URL del avatar
    return this.userService.processAvatarUrl(avatarUrl);
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
    return this.http.put<UserModel>(`${this.apiUrl}/${userId}`, userData)
      .pipe(
        map(user => this.parseUserDate(user))
      );
  }

  setUserStatus(userId: string, isEnabled: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/status`, { isEnabled });
  }

  // New method to change admin status
  setUserAdminStatus(userId: string, isAdmin: boolean): Observable<any> {
    return this.http.put(`${this.authUrl}/admin-status`, { userId, isAdmin });
  }

  // Método específico para cambiar el estado (activo/inactivo)
  setUserActiveStatus(userId: string, isActive: boolean): Observable<any> {
    return this.setUserStatus(userId, isActive);
  }

  // Helper para convertir strings de fecha a objetos Date


  private parseUserDate(user: UserModel): UserModel {
    return {
      ...user,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
    };
  }
}
