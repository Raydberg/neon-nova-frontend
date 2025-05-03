import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthService } from './auth.service';
import { FavoriteProduct } from '@app/core/interfaces/favotite-http.interface';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = `${environment.apiUrl}/favorites`;

  // Signal para mantener la lista de IDs de los productos favoritos del usuario
  private _favoriteProductIds = signal<number[]>([]);
  readonly favoriteProductIds = this._favoriteProductIds.asReadonly();

  // Signal para los productos favoritos completos - usando FavoriteProduct
  private _favorites = signal<FavoriteProduct[]>([]);
  readonly favorites = this._favorites.asReadonly();

  // Signal para el estado de carga
  private _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor() {
    // Cargar favoritos iniciales si el usuario está autenticado
    if (this.authService.isLoggedIn()) {
      this.loadFavorites().subscribe();
    }
  }

  // Cargar todos los favoritos del usuario
  loadFavorites(): Observable<FavoriteProduct[]> {
    if (!this.authService.isLoggedIn()) {
      return of([]);
    }

    this._isLoading.set(true);

    return this.http.get<FavoriteProduct[]>(this.baseUrl).pipe(
      tap(favorites => {
        console.log('Favoritos cargados:', favorites);
        this._favorites.set(favorites);
        this._favoriteProductIds.set(favorites.map(f => f.id));
        this._isLoading.set(false);
      }),
      catchError(error => {
        console.error('Error cargando favoritos:', error);
        this._isLoading.set(false);
        return of([]);
      })
    );
  }

  // Comprobar si un producto específico está en favoritos
  checkIsFavorite(productId: number): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      return of(false);
    }

    return this.http.get<boolean>(`${this.baseUrl}/check/${productId}`).pipe(
      catchError(() => of(false))
    );
  }

  // Método local para comprobar si un producto está en favoritos (sin llamar al API)
  isFavorite(productId: number): boolean {
    return this._favoriteProductIds().includes(productId);
  }

  // Alternar el estado de favorito de un producto
  toggleFavorite(productId: number): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      return of(false);
    }

    console.log(`Alternando favorito para producto ID: ${productId}`);
    return this.http.post<{ isFavorite: boolean }>(`${this.baseUrl}/toggle/${productId}`, {}).pipe(
      tap(response => {
        console.log(`Respuesta de toggle: ${JSON.stringify(response)}`);
        if (response.isFavorite) {
          // Si se añadió a favoritos
          if (!this.isFavorite(productId)) {
            this._favoriteProductIds.update(ids => [...ids, productId]);
          }
          // Recargar favoritos para obtener la información completa
          this.loadFavorites().subscribe();
        } else {
          // Si se eliminó de favoritos
          this._favoriteProductIds.update(ids => ids.filter(id => id !== productId));
          this._favorites.update(favs => favs.filter(fav => fav.id !== productId));
        }
      }),
      map(response => response.isFavorite),
      catchError(error => {
        console.error('Error al cambiar estado de favorito:', error);
        return of(false);
      })
    );
  }

  // Añadir un producto a favoritos
  addToFavorites(productId: number): Observable<any> {
    if (!this.authService.isLoggedIn()) {
      return of(null);
    }

    return this.http.post(this.baseUrl, { productId }).pipe(
      tap(() => {
        if (!this.isFavorite(productId)) {
          this._favoriteProductIds.update(ids => [...ids, productId]);
          // Recargar para obtener la información completa
          this.loadFavorites().subscribe();
        }
      }),
      catchError(error => {
        console.error('Error añadiendo a favoritos:', error);
        return of(null);
      })
    );
  }

  // Eliminar un producto de favoritos usando toggle
  removeProductFromFavorites(productId: number): Observable<any> {
    if (!this.authService.isLoggedIn()) {
      return of(null);
    }

    console.log(`Eliminando favorito para producto ID: ${productId}`);

    // Usamos el endpoint toggle para eliminar el favorito
    return this.toggleFavorite(productId).pipe(
      map(() => null) // Convertimos la respuesta a null para compatibilidad
    );
  }

  // Limpiar todos los favoritos
  clearAllFavorites(): Observable<any> {
    if (!this.authService.isLoggedIn() || this._favorites().length === 0) {
      return of(null);
    }

    const productIds = this._favorites().map(fav => fav.id);
    console.log(`Eliminando todos los favoritos: ${productIds.join(', ')}`);

    const deleteRequests: Observable<any>[] = productIds
      .map(id => this.removeProductFromFavorites(id));

    // No usamos forkJoin para mantener la simplicidad
    // Simplemente devolvemos el último observable
    const lastRequest = deleteRequests[deleteRequests.length - 1];
    return lastRequest || of(null);
  }
}
