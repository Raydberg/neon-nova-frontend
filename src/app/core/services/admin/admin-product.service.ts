import {HttpClient, HttpParams} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {catchError, map, Observable, tap, throwError} from 'rxjs';
import {ProductResponseClient} from '@core/interfaces/product-client.interface';


export interface CreateProductDto {
  name: string,
  description: string,
  price: number,
  stock: number,
  categoryId: number,
  status: number
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  category: {
    id: number;
    name: string;
    description: string;
  };
  createdAt: string;
  stock: number;
  status: number;
  images: {
    id: number;
    imageUrl: string;
    createdAt: string;
  }[];
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: number;
  status?: number;
}


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


  getProductById(id: number): Observable<ProductDetailResponse> {
    return this.http.get<ProductDetailResponse>(`${this.API_URL}/product/${id}`).pipe(
      tap(product => console.log('Producto cargado:', product)),
      catchError(error => {
        console.error(`Error al cargar el producto ${id}:`, error);
        return throwError(() => new Error(`Error al cargar el producto: ${error.message || 'Error desconocido'}`));
      })
    );
  }
  addProductImage(productId: number, imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('Image', imageFile);

    return this.http.post<any>(`${this.API_URL}/product/${productId}/images`, formData).pipe(
      tap(() => console.log(`Imagen añadida al producto ${productId}`)),
      catchError(error => {
        console.error(`Error al añadir imagen al producto ${productId}:`, error);
        return throwError(() => new Error(`Error al añadir imagen: ${error.message || 'Error desconocido'}`));
      })
    );
  }
  // Método actualizado para actualización parcial
// Método actualizado para actualización parcial
updateProduct(id: number, productData: UpdateProductDto): Observable<any> {
  console.log('Actualizando producto:', id, productData);

  // Crear un FormData para enviar los datos en el formato correcto
  const formData = new FormData();

  // Añadir cada campo al FormData
  if (productData.name !== undefined) formData.append("Name", productData.name);
  if (productData.description !== undefined) formData.append("Description", productData.description);
  if (productData.price !== undefined) formData.append("Price", productData.price.toString());
  if (productData.stock !== undefined) formData.append("Stock", productData.stock.toString());
  if (productData.categoryId !== undefined) formData.append("CategoryId", productData.categoryId.toString());
  if (productData.status !== undefined) formData.append("Status", productData.status.toString());

  return this.http.put<any>(`${this.API_URL}/product/${id}`, formData).pipe(
    tap(() => console.log(`Producto ${id} actualizado correctamente`)),
    catchError(error => {
      console.error(`Error al actualizar el producto ${id}:`, error);
      return throwError(() => new Error(`Error al actualizar el producto: ${error.message || 'Error desconocido'}`));
    })
  );
}
  deleteProductImage(productId: number, imageId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/product/${productId}/images/${imageId}`).pipe(
      tap(() => console.log(`Imagen ${imageId} eliminada del producto ${productId}`)),
      catchError(error => {
        console.error(`Error al eliminar imagen ${imageId} del producto ${productId}:`, error);
        return throwError(() => new Error(`Error al eliminar imagen: ${error.message || 'Error desconocido'}`));
      })
    );
  }
  updateProductImage(productId: number, imageId: number, imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('ImageId', imageId.toString());
    formData.append('Image', imageFile);

    return this.http.put<any>(`${this.API_URL}/product/${productId}/images/${imageId}`, formData).pipe(
      tap(() => console.log(`Imagen ${imageId} actualizada en el producto ${productId}`)),
      catchError(error => {
        console.error(`Error al actualizar imagen ${imageId} del producto ${productId}:`, error);
        return throwError(() => new Error(`Error al actualizar imagen: ${error.message || 'Error desconocido'}`));
      })
    );
  }
  // Método para obtener todos los productos con paginación
  getAdminProducts(
    pageNumber: number = this.defaultParams.pageNumber,
    pageSize: number = this.defaultParams.pageSize,
    searchQuery?: string,
    categoryId?: number | null,
    status?: string | null
  ): Observable<ProductResponseClient> {
    // Construir los parámetros de consulta
    let params = new HttpParams()
      .set("pageNumber", pageNumber.toString())
      .set("pageSize", pageSize.toString());

    // Añadir filtros solo si están presentes
    if (searchQuery && searchQuery.trim() !== '') {
      // IMPORTANTE: Asegúrate que este nombre coincide exactamente con el parámetro en tu backend
      params = params.set("searchTerm", searchQuery);
    }

    if (categoryId) {
      params = params.set("categoryId", categoryId.toString());
    }

    // Convertir el status de string a número según el backend
    if (status) {
      let statusNumber: number;
      switch (status) {
        case 'active':
          statusNumber = 1; // Activo
          break;
        case 'inactive':
          statusNumber = 2; // Inactivo
          break;
        case 'outOfStock':
          statusNumber = 3; // Sin Stock
          break;
        default:
          statusNumber = 0; // No filtrar
      }

      if (statusNumber > 0) {
        params = params.set("status", statusNumber.toString());
      }
    }

    // Añadir logs más detallados
    console.log("Enviando solicitud GET a:", `${this.API_URL}/product/simplified-admin`);
    console.log("Parámetros:", {
      pageNumber,
      pageSize,
      searchQuery: searchQuery || 'no especificado',
      categoryId: categoryId || 'no especificado',
      status: status || 'no especificado',
      statusNumber: status ? (status === 'active' ? 1 : status === 'inactive' ? 2 : status === 'outOfStock' ? 3 : 0) : 'no aplicado'
    });
    console.log("Query string completo:", params.toString());

    return this.http.get<ProductResponseClient>(`${this.API_URL}/product/simplified-admin`, {params}).pipe(
      tap(response => {
        console.log('Admin productos cargados:', response.totalItems, 'Página:', pageNumber, 'Total páginas:', response.totalPages);
      }),
      catchError(error => {
        console.error("Error al traer los productos para admin", error);
        console.error("Detalles de la solicitud fallida:", {
          url: `${this.API_URL}/product/simplified-admin`,
          params: params.toString(),
          error: error.message || 'Error desconocido'
        });
        return throwError(() => new Error("Error al cargar los productos para admin"));
      })
    );
  }

  createProduct(productData: CreateProductDto, images: File[]): Observable<any> {
    const formData = new FormData();
    formData.append("Name", productData.name)
    formData.append("Description", productData.description)
    formData.append("Price", productData.price.toString())
    formData.append("Stock", productData.stock.toString())
    formData.append("CategoryId", productData.categoryId.toString())
    formData.append("Status", productData.status.toString())

    if (images && images.length > 0) {
      images.forEach(file => {
        formData.append("Images", file)
      })
    }

    return this.http.post<any>(`${this.API_URL}/product`, formData).pipe(
      catchError(error => {
        console.error("Error al crear el producto", error)
        return throwError(() => new Error(`Error al crear el producto:${error.message || 'Error Desconocido'} `))
      })
    )

  }


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
