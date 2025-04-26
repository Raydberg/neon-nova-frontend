import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CategoryModel } from '@app/core/models/category-model';
import { environment } from '@environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminCategoryService {

  private http = inject(HttpClient)
  private readonly baseUrl = environment.apiUrl;

  getAllCategories(): Observable<CategoryModel> {
    return this.http.get<CategoryModel>(`${this.baseUrl}/category`).pipe(
      catchError(error => {
        console.error("Error al traer las categorias", error)
        return throwError(() => new Error("Error al cargar las categorias", error))
      })
    )
  }
}
