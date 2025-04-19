import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserModel } from '@core/models/user-model';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/user`;

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

  enableUser(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/enable`, {});
  }

  disableUser(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/disable`, {});
  }

  // Método específico para cambiar el estado (activo/inactivo)
  setUserActiveStatus(userId: string, isActive: boolean): Observable<any> {
    return isActive
      ? this.enableUser(userId)
      : this.disableUser(userId);
  }

  // Helper para convertir strings de fecha a objetos Date
  private parseUserDates(users: UserModel[]): UserModel[] {
    return users.map(user => this.parseUserDate(user));
  }

  private parseUserDate(user: UserModel): UserModel {
    return {
      ...user,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
    };
  }
}
