import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import type { ProductResponseClient, Products } from '../interfaces/product-client.interface';
import type { ProductByCategory, Item } from '../interfaces/product-by-category.interface';
import type { ProductByComments } from '../interfaces/product-by-comments.interface';

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

  getProducts(
    pageNumber: number = this.defaultParams.pageNumber,
    pageSize: number = this.defaultParams.pageSize,
    searchQuery?: string,
    categoryId?: number | null
  ): Observable<ProductResponseClient> {
    let params = new HttpParams()
      .set("pageNumber", pageNumber.toString())
      .set("pageSize", pageSize.toString());

    if (searchQuery && searchQuery.trim() !== '') {
      params = params.set("searchTerm", searchQuery.trim());
      console.log('Buscando productos con término:', searchQuery.trim());
    }

    if (categoryId !== null && categoryId !== undefined) {
      params = params.set("categoryId", categoryId.toString());
      console.log('Filtrando por categoría:', categoryId);
    }

    return this.http.get<ProductResponseClient>(`${this.API_URL}/product/simplified`, { params }).pipe(
      tap(response => {
        console.log(
          'Productos cargados:',
          response.totalItems,
          'Término búsqueda:', searchQuery || 'ninguno',
          'Categoría:', categoryId || 'todas'
        );
      }),
      catchError(error => {
        console.error("Error al traer los productos", error);
        return throwError(() => new Error("Error al cargar los productos"));
      })
    );
  }


  getProductsByCategoryWithFirstImage(
    categoryId: number,
    pageNumber: number = this.defaultParams.pageNumber,
    pageSize: number = this.defaultParams.pageSize,
    searchQuery?: string
  ): Observable<ProductResponseClient> {
    // Just call the main method with the category parameter
    return this.getProducts(pageNumber, pageSize, searchQuery, categoryId);
  }

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

  getProductWithComments(
    productId: number | null,
    commentsPage: number = 1,
    commentsPageSize: number = 5
  ): Observable<ProductByComments> {
    if (productId === null) {
      return throwError(() => new Error('ID de producto no válido'));
    }

    let params = new HttpParams()
      .set('commentsPage', commentsPage.toString())
      .set('commentsPageSize', commentsPageSize.toString());

    return this.http.get<ProductByComments>(
      `${this.API_URL}/product/${productId}/with-comments`,
      { params }
    ).pipe(
      catchError(error => {
        console.error(`Error loading product ${productId} details:`, error);
        if (error.status === 404) {
          return throwError(() => new Error('Producto no encontrado'));
        }
        return throwError(() => new Error(`Error al cargar el detalle del producto: ${error.message || 'Error desconocido'}`));
      })
    );
  }
}
