import {HttpClient} from '@angular/common/http';
import {inject, Injectable, signal} from '@angular/core';
import {catchError, map, Observable, tap, throwError} from 'rxjs';
import type {CartShopClient} from '../models/cart-shop.model';
import {environment} from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient)
  private readonly baseUrl = environment.apiUrl;

  private _cartItemCount = signal<number>(0);
  readonly cartItemCount = this._cartItemCount.asReadonly();

  updateCartCount(): void {
    this.getAllCartShop().subscribe({
      next: (cart) => {
        const count = cart?.details?.length || 0;
        this._cartItemCount.set(count);
      },
      error: (err) => {
        console.error('Error updating cart count:', err);
        this._cartItemCount.set(0);
      }
    });
  }

  getAllCartShop(): Observable<CartShopClient> {
    return this.http.get<CartShopClient>(`${this.baseUrl}/cart`).pipe(
      tap(cart => console.log("Obteniendo el carrito de compras", cart)),
      catchError(error => {
        console.error("Error al traer los productos", error)
        return throwError(() => new Error("Error al cargar los productos"))
      })
    )
  }

  addCartShop(productId: number | undefined, quantity: number = 1): Observable<any> {
    return this.http.post(`${this.baseUrl}/cart`, {
      productId, quantity
    }).pipe(
      tap(() => this.updateCartCount()),
      catchError(error => {
        console.error("Error al añadir producto al carrito")
        return throwError(() => new Error("Error al añadir producto al carrito"))
      })
    )
  }

  updateCartItem(cartDetailId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/cart`, {
      cartDetailId, quantity
    }).pipe(
      catchError(error => {
        console.error("Error al actualizar el carrito")
        return throwError(() => new Error("Error al actualizar el carrito"))
      })
    )
  }

  removeCartItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cart/${itemId}`).pipe(
      tap(() => this.updateCartCount()),
      catchError(error => {
        console.error(`Error al eliminar el producto con id ${itemId} del carrito de compras `)
        return throwError(() => new Error(`Error al eliminar el producto de id : ${itemId} del carrito de compras`))
      })
    )
  }

  removeCleanCart(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cart/clear`).pipe(
      tap(() => this._cartItemCount.set(0)),
      catchError(error => {
        console.error("Error al eliminar los productos del carrito de compras")
        return throwError(() => new Error("Error al eliminar los productos del carrito de compras"))
      })
    )
  }


}
