import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {CategoryModel, Item} from '@app/core/models/category-model';
import {environment} from '@environments/environment';
import {catchError, Observable, throwError} from 'rxjs';

interface CategoryDTO {
  id?: number;
  name: string;
  description: string;
}

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

  createCategory(category: CategoryDTO): Observable<Item> {
    return this.http.post<Item>(`${this.baseUrl}/category`, category).pipe(
      catchError(error => {
        console.error("Error al crear la categoría", error)
        return throwError(() => new Error("Error al crear la categoría", error))
      })
    )
  }

  updateCategory(id: number, category: CategoryDTO): Observable<Item> {
    return this.http.put<Item>(`${this.baseUrl}/category/${id}`, category).pipe(
      catchError(error => {
        console.error("Error al actualizar la categoría", error)
        return throwError(() => new Error("Error al actualizar la categoría", error))
      })
    )
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/category/${id}`).pipe(
      catchError(error => {
        console.error("Error al eliminar la categoría", error)
        return throwError(() => new Error("Error al eliminar la categoría", error))
      })
    )
  }
}
