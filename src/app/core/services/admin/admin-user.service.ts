import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@environments/environment';
import {Observable} from 'rxjs';
import {UserModel} from '@core/models/user-model';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/user`

  getUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(this.apiUrl);
  }

  enableUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/${userId}/enable`, {});
  }

  disableUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/${userId}/disable`, {});
  }

  updateUserStatus(userId: string, isActive: boolean): Observable<any> {
    const endpoint = isActive ? `/user/${userId}/enable` : `/user/${userId}/disable`;
    return this.http.post(`${this.apiUrl}${endpoint}`, {});
  }
}
