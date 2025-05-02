import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@environments/environment';
import {Observable} from 'rxjs';
import {DashboardStacks} from '@core/interfaces/http-dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient)
  private  baseUrl = environment.apiUrl

  constructor() {
  }


  getAllStacksDashboard(): Observable<any> {
    return this.http.get<DashboardStacks>(`${this.baseUrl}/dashboard`)
  }


}
