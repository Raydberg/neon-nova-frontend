import {HttpClient} from '@angular/common/http';
import {inject, Injectable, signal, effect} from '@angular/core';
import {catchError, Observable, of, tap, throwError, Subject} from 'rxjs';
import type {CartShopClient} from '../models/cart-shop.model';
import {environment} from '@environments/environment';

interface CartItemCount {
  [productId: number]: number
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient)
  private readonly baseUrl = environment.apiUrl;

  private _cartItemCount = signal<number>(0);
  private _cartItems = signal<CartItemCount>({});

  // Añadimos un Subject para notificar cambios en el carrito
  private cartChanges = new Subject<void>();
  readonly cartChanges$ = this.cartChanges.asObservable();

  readonly cartItemCount = this._cartItemCount.asReadonly();
  readonly cartItems = this._cartItems.asReadonly();

  constructor() {
    this.loadCartItem();
  }

  loadCartItem(): void {
    this.getAllCartShop().subscribe({
      next: (cart) => {
        const itemCount: CartItemCount = {};
        cart?.details.forEach(item => {
          if (item.productId) {
            itemCount[item.productId] = item.quantity;
          }
        });
        this._cartItems.set(itemCount);
        this._cartItemCount.set(cart?.details.length || 0);
        // Notificar que el carrito ha cambiado
        this.cartChanges.next();
      },
      error: (error => {
        console.error("Error loading cart items:", error);
      })
    });
  }

  getProductQuantityInCart(productId: number): number {
    return this._cartItems()[productId] || 0;
  }

  getAvailableStock(productId: number, totalStock: number): Observable<number> {
    return of(totalStock - this.getProductQuantityInCart(productId));
  }

  updateCartCount(): void {
    this.getAllCartShop().subscribe({
      next: (cart) => {
        const count = cart?.details?.length || 0;
        this._cartItemCount.set(count);

        const itemCount: CartItemCount = {};
        cart?.details?.forEach(item => {
          if (item.productId) {
            itemCount[item.productId] = item.quantity;
          }
        });
        this._cartItems.set(itemCount);

        // Notificar que el carrito ha cambiado
        this.cartChanges.next();
      },
      error: (err) => {
        console.error('Error updating cart count:', err);
        this._cartItemCount.set(0);
        this._cartItems.set({});
      }
    });
  }


  incrementCartItem(cartDetailId: number, productId?: number, maxStock?: number): Observable<any> {
    if (!cartDetailId) return throwError(() => new Error("ID de detalle de carrito no válido"));

    // Si productId y maxStock están definidos, verificamos que no se exceda el stock
    if (productId !== undefined && maxStock !== undefined) {
      const currentQuantity = this.getProductQuantityInCart(productId);

      if (currentQuantity >= maxStock) {
        return throwError(() => new Error(`No puedes añadir más unidades de este producto. Stock máximo: ${maxStock}`));
      }
    }

    return this.http.post(`${this.baseUrl}/cart/increment/${cartDetailId}`, {}).pipe(
      tap(() => {
        // Si tenemos el productId, actualizamos el mapa local inmediatamente
        if (productId !== undefined) {
          const currentItems = {...this._cartItems()};
          currentItems[productId] = (currentItems[productId] || 0) + 1;
          this._cartItems.set(currentItems);
          // Notificamos el cambio
          this.cartChanges.next();
        }
      }),
      catchError(error => {
        console.error(`Error al incrementar el producto en el carrito:`, error);

        // Mejorar el mensaje de error
        let errorMessage = "Error al actualizar el carrito";

        // Intentar extraer un mensaje de error más específico si está disponible
        if (error.error && typeof error.error === 'object' && 'message' in error.error) {
          errorMessage = error.error.message;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

decrementCartItem(cartDetailId: number, productId?: number): Observable<any> {
  if (!cartDetailId) return throwError(() => new Error("ID de detalle de carrito no válido"));

  return this.http.post(`${this.baseUrl}/cart/decrement/${cartDetailId}`, {}).pipe(
    tap(() => {
      // Si tenemos el productId, actualizamos el mapa local inmediatamente
      if (productId !== undefined) {
        const currentItems = {...this._cartItems()};
        if (currentItems[productId] && currentItems[productId] > 1) {
          currentItems[productId] = currentItems[productId] - 1;
          this._cartItems.set(currentItems);
        }
        // Notificamos el cambio
        this.cartChanges.next();
      }
    }),
    catchError(error => {
      console.error(`Error al decrementar el producto en el carrito`, error);
      return throwError(() => new Error("Error al actualizar el carrito"));
    })
  );
}


  updateCartItem(cartDetailId: number, quantity: number, maxStock?: number, productId?: number): Observable<any> {
    // Verificar que no se exceda el stock si se proporciona productId y maxStock
    if (productId !== undefined && maxStock !== undefined) {
      const currentInCart = this.getProductQuantityInCart(productId);
      const currentDetail = this._cartItems()[productId] || 0;

      // Calculamos cuánto aumentará la cantidad (puede ser negativo si disminuye)
      const change = quantity - currentDetail;

      if (currentInCart + change > maxStock) {
        return throwError(() => new Error(`No hay suficiente stock disponible. Solo quedan ${maxStock} unidades.`));
      }
    }

    // Cambiamos a POST y enviamos el formato requerido por tu API
    return this.http.put(`${this.baseUrl}/cart`, {
      cartDetailId,
      quantity
    }).pipe(
      tap(() => {
        // Si tenemos el productId, actualizamos el mapa local inmediatamente
        if (productId !== undefined) {
          const currentItems = {...this._cartItems()};
          currentItems[productId] = quantity;
          this._cartItems.set(currentItems);
          // Notificamos el cambio
          this.cartChanges.next();
        }
      }),
      catchError(error => {
        console.error("Error al actualizar el carrito", error);
        return throwError(() => new Error("Error al actualizar el carrito"));
      })
    );
  }
  getAllCartShop(): Observable<CartShopClient> {
    return this.http.get<CartShopClient>(`${this.baseUrl}/cart`).pipe(
      tap(cart => console.log("Obteniendo el carrito de compras", cart)),
      catchError(error => {
        console.error("Error al traer los productos", error);
        return throwError(() => new Error("Error al cargar los productos"));
      })
    );
  }

  addCartShop(productId: number | undefined, quantity: number = 1, maxStock?: number): Observable<any> {
    if (!productId) return throwError(() => new Error("ID de producto no válido"));

    // Verificar que no se exceda el stock
    if (maxStock !== undefined) {
      const currentInCart = this.getProductQuantityInCart(productId);
      if (currentInCart + quantity > maxStock) {
        return throwError(() => new Error(`Solo hay ${maxStock} unidades disponibles. Ya tienes ${currentInCart} en tu carrito.`));
      }
    }

    const currentItems = {...this._cartItems()};
    currentItems[productId] = (currentItems[productId] || 0) + quantity;
    this._cartItems.set(currentItems);

    return this.http.post(`${this.baseUrl}/cart`, {
      productId, quantity
    }).pipe(
      tap(() => {
        this.updateCartCount();
      }),
      catchError(error => {
        const revertItems = {...this._cartItems()};
        revertItems[productId] = (revertItems[productId] || 0) - quantity;
        if (revertItems[productId] <= 0) delete revertItems[productId];
        this._cartItems.set(revertItems);

        console.error("Error al añadir producto al carrito");
        return throwError(() => new Error("Error al añadir producto al carrito"));
      })
    );
  }


  removeCartItem(itemId: number, productId?: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cart/${itemId}`).pipe(
      tap(() => {
        // Si tenemos el productId, lo eliminamos del mapa local inmediatamente
        if (productId !== undefined) {
          const currentItems = {...this._cartItems()};
          delete currentItems[productId];
          this._cartItems.set(currentItems);
          // Notificamos el cambio
          this.cartChanges.next();
        }
        this.updateCartCount();
      }),
      catchError(error => {
        console.error(`Error al eliminar el producto con id ${itemId} del carrito de compras`);
        return throwError(() => new Error(`Error al eliminar el producto de id : ${itemId} del carrito de compras`));
      })
    );
  }

  removeCleanCart(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cart/clear`).pipe(
      tap(() => {
        // Limpiamos todo el estado local
        this._cartItemCount.set(0);
        this._cartItems.set({});
        // Notificamos el cambio
        this.cartChanges.next();
      }),
      catchError(error => {
        console.error("Error al eliminar los productos del carrito de compras");
        return throwError(() => new Error("Error al eliminar los productos del carrito de compras"));
      })
    );
  }
}
