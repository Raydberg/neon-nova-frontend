import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private http = inject(HttpClient)
  private readonly baseUrl = environment.apiUrl;

  getCategories():Observable<any>{
    return this.http.get(`${this.baseUrl}/category/landing`)
  }

}
