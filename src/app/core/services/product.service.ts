import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { ProductResponseClient } from '../interfaces/product-client.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private API_URL = environment.apiUrl;
  private http = inject(HttpClient)

  private defaultParams = {
    pageNumber: 1,
    pageSize: 10
  }

  getProducts(pageNumber: number = this.defaultParams.pageNumber,
    pageSize: number = this.defaultParams.pageSize
  ): Observable<ProductResponseClient> {
    const params = new HttpParams()
      .set("pageNumber", pageNumber.toString())
      .set("pageSize", pageSize.toString())
    return this.http.get<ProductResponseClient>(`${this.API_URL}/product/simplified`).pipe(
      catchError(error => {
        console.error("Error al traer los productos", error);
        return throwError(() => new Error("Error al cargar los productos"))
      })
    )
  }


}
