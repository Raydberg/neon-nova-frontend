import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { ProductResponseClient, Products } from '../interfaces/product-client.interface';
import { ProductByCategory, Item } from '../interfaces/product-by-category.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private API_URL = environment.apiUrl;
  private http = inject(HttpClient);

  private defaultParams = {
    pageNumber: 1,
    pageSize: 10
  };

  // Método general para productos (sin filtro por categoría)
  getProducts(
    pageNumber: number = this.defaultParams.pageNumber,
    pageSize: number = this.defaultParams.pageSize,
    searchQuery?: string
  ): Observable<ProductResponseClient> {
    let params = new HttpParams()
      .set("pageNumber", pageNumber.toString())
      .set("pageSize", pageSize.toString());

    if (searchQuery && searchQuery.trim() !== '') {
      params = params.set("search", searchQuery);
    }

    return this.http.get<ProductResponseClient>(`${this.API_URL}/product/simplified`, { params }).pipe(
      tap(response => {
        console.log('Productos cargados (general):', response.totalItems);
      }),
      catchError(error => {
        console.error("Error al traer los productos", error);
        return throwError(() => new Error("Error al cargar los productos"));
      })
    );
  }

  // Método específico para productos por categoría con la primera imagen
  getProductsByCategoryWithFirstImage(
    categoryId: number,
    pageNumber: number = this.defaultParams.pageNumber,
    pageSize: number = this.defaultParams.pageSize,
    searchQuery?: string
  ): Observable<ProductResponseClient> {
    let params = new HttpParams()
      .set("pageNumber", pageNumber.toString())
      .set("pageSize", pageSize.toString());

    if (searchQuery && searchQuery.trim() !== '') {
      params = params.set("search", searchQuery);
    }

    console.log(`Solicitando productos de categoría ${categoryId}...`);

    // Cambiamos el tipo de respuesta para que coincida con la estructura real
    return this.http.get<ProductByCategory>(
      `${this.API_URL}/category/${categoryId}/products-with-first-image`,
      { params }
    ).pipe(
      // Ver la estructura exacta de datos para depuración
      tap(response => {
        console.log(`Productos de categoría ${categoryId} recibidos:`, response.totalItems);
        if (response.items.length > 0) {
          console.log('Estructura del primer producto:', response.items[0]);
        }
      }),
      // Transformar la respuesta al formato esperado por el componente
      map(response => {
        // Crear un nuevo objeto con la estructura de ProductResponseClient
        return {
          items: response.items.map(item => this.mapCategoryItemToProduct(item)),
          totalItems: response.totalItems,
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalPages: response.totalPages
        } as ProductResponseClient;
      }),
      catchError(error => {
        console.error(`Error al cargar productos de categoría ${categoryId}`, error);
        return throwError(() => new Error(`Error al cargar productos de la categoría ${categoryId}`));
      })
    );
  }

  // Método para convertir un Item de categoría a un Products estándar
  private mapCategoryItemToProduct(item: Item): Products {
    return {
      id: item.id,
      name: item.name,
      price: item.price,
      categoryId: item.category?.id || 0,
      categoryName: item.category?.name || '',
      punctuation: item.punctuation || 0,
      imageUrl: item.firstImage?.imageUrl || '',
    };
  }

  // Método para obtener el detalle completo de un producto
  getProductDetail(productId: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/product/${productId}/detail`).pipe(
      catchError(error => {
        console.error(`Error al cargar el detalle del producto ${productId}`, error);
        return throwError(() => new Error(`Error al cargar el detalle del producto`));
      })
    );
  }
}
