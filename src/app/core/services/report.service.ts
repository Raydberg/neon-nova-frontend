import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  generateProductReport(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/report/generate-product`, {
      responseType: 'blob'
    });
  }

  generateUserReport(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/report/generate-user`, {
      responseType: 'blob'
    });
  }
}
