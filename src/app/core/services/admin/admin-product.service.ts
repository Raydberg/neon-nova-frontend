import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { ProductResponseClient } from '@core/interfaces/product-client.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {
  private API_URL = environment.apiUrl;
  private http = inject(HttpClient);

  private defaultParams = {
    pageNumber: 1,
    pageSize: 10
  };

  // Método para obtener todos los productos con paginación
  getAdminProducts(
    pageNumber: number = this.defaultParams.pageNumber,
    pageSize: number = this.defaultParams.pageSize,
    searchQuery?: string,
    categoryId?: string | null,
    status?: string | null
  ): Observable<ProductResponseClient> {
    // Only include parameters that the API endpoint supports
    let params = new HttpParams()
      .set("pageNumber", pageNumber.toString())
      .set("pageSize", pageSize.toString());

    // Note: We're removing the additional parameters that aren't supported by your API
    // If you need filtering, you'll need to implement it client-side or update your backend

    return this.http.get<ProductResponseClient>(`${this.API_URL}/product/simplified`, { params }).pipe(
      tap(response => {
        console.log('Admin productos cargados:', response.totalItems, 'Página:', pageNumber, 'Total páginas:', response.totalPages);
      }),
      catchError(error => {
        console.error("Error al traer los productos para admin", error);
        return throwError(() => new Error("Error al cargar los productos para admin"));
      })
    );
  }

  // Método para eliminar un producto
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/product/${id}`).pipe(
      tap(() => console.log(`Producto ${id} eliminado correctamente`)),
      catchError(error => {
        console.error(`Error eliminando producto ${id}:`, error);
        return throwError(() => new Error(`Error eliminando producto: ${error.message || 'Error desconocido'}`));
      })
    );
  }
}
