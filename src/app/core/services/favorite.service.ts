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

  private _favoriteProductIds = signal<number[]>([]);
  readonly favoriteProductIds = this._favoriteProductIds.asReadonly();

  private _favorites = signal<FavoriteProduct[]>([]);
  readonly favorites = this._favorites.asReadonly();

  private _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.loadFavorites().subscribe();
    }
  }

  loadFavorites(): Observable<FavoriteProduct[]> {
    if (!this.authService.isLoggedIn()) {
      return of([]);
    }

    this._isLoading.set(true);

    return this.http.get<FavoriteProduct[]>(this.baseUrl).pipe(
      tap(favorites => {
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

  checkIsFavorite(productId: number): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      return of(false);
    }

    return this.http.get<boolean>(`${this.baseUrl}/check/${productId}`).pipe(
      catchError(() => of(false))
    );
  }

  isFavorite(productId: number): boolean {
    return this._favoriteProductIds().includes(productId);
  }

  toggleFavorite(productId: number): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      return of(false);
    }

    return this.http.post<{ isFavorite: boolean }>(`${this.baseUrl}/toggle/${productId}`, {}).pipe(
      tap(response => {
        if (response.isFavorite) {
          if (!this.isFavorite(productId)) {
            this._favoriteProductIds.update(ids => [...ids, productId]);
          }
          this.loadFavorites().subscribe();
        } else {
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
    const deleteRequests: Observable<any>[] = productIds
      .map(id => this.removeProductFromFavorites(id));

    const lastRequest = deleteRequests[deleteRequests.length - 1];
    return lastRequest || of(null);
  }
}
