import { HttpClient } from '@angular/common/http';
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



  getProducts(): Observable<ProductResponseClient[]> {
    return this.http.get<ProductResponseClient[]>(`${this.API_URL}/product`).pipe(
      catchError(error => {
        console.error("Error al traer los productos", error);
        return throwError(() => new Error("Error al cargar los productos"))
      })
    )
  }

  // getProductById(id: string): Observable<ProductResponse> {
  //   return this.http.get<ProductResponse>(`${this.API_URL}/product/${id}`).pipe(
  //     tap(data => console.log("Products Recibidos", data)),
  //     catchError(error => {
  //       console.error(`Error loading product ${id}:`, error);
  //       return throwError(() => new Error("Error al cargar el producto"))
  //     })
  //   )
  // }

}
