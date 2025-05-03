import {ChangeDetectionStrategy, Component, effect, inject, OnInit, signal} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {RouterModule} from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';
import {CartItemComponent} from './cart-item/cart-item.component';
import {CartSummaryComponent} from './cart-summary/cart-summary.component';
import {CartService} from '@app/core/services/cart.service';
import {rxResource} from '@angular/core/rxjs-interop';
import {finalize, of} from 'rxjs';
import {CartShopClient, Detail} from '@app/core/models/cart-shop.model';
import {NotificationService} from '@core/services/notification.service';
import {AuthService} from '@core/services/auth.service';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    CartItemComponent,
    CartSummaryComponent
  ],
  templateUrl: './cart.component.html',
  styleUrl: "./cart.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent implements OnInit {
  private location = inject(Location);
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);
   readonly authService = inject(AuthService);

  cartResource = rxResource({
    loader: () => {
      if (this.authService.isLoggedIn()) {
        return this.cartService.getAllCartShop();
      } else {
        return of(null);
      }
    }
  });

  cart = signal<CartShopClient | null>(null);
  cartItems = signal<Detail[]>([]); // Usamos Detail de cart-shop.model.ts
  removingItemId = signal<number | null>(null);
  isUpdating = signal(false);
  updatingItemIds = signal<number[]>([]);

  animationDuration = 500;

  constructor() {
    // Utilizamos un efecto para actualizar los datos cuando cartResource cambie
    // En el efecto que maneja la carga del carrito:
effect(() => {
  const result = this.cartResource.value();
  console.log('Raw cart response:', result);

  if (result && result.details) {
    const cart = result;
    this.cart.set(cart);

    // Aquí es importante asegurarnos de que 'stock' se asigna correctamente
    const cartItems = cart.details.map(item => {
      console.log(`Item ${item.productId}: Stock value =`, item.stock);
      return {
        ...item,
        // Si stock es undefined, null o 0, establecemos un valor alto predeterminado
        stock: item.stock !== undefined && item.stock !== null && item.stock > 0
          ? item.stock
          : 999 // Un valor alto predeterminado si no hay límite de stock
      };
    });

    this.cartItems.set(cartItems);
    console.log('Processed cart items with stock:', cartItems);
  } else {
    console.log('Empty or invalid cart response:', result);
    this.cart.set(null);
    this.cartItems.set([]);
  }
});
  }

  ngOnInit() {
    // Iniciamos la carga de datos
    this.cartResource.reload();
  }

  updateQuantity(event: { id: number, quantity: number, productId: number, maxStock?: number, action?: 'increment' | 'decrement' }) {
    if (this.isUpdating()) return;

    // Agregar el ID del elemento a la lista de actualizaciones
    this.updatingItemIds.update(ids => [...ids, event.id]);

    const request = event.action === 'increment'
      ? this.cartService.incrementCartItem(event.id, event.productId)
      : event.action === 'decrement'
      ? this.cartService.decrementCartItem(event.id, event.productId)
      : this.cartService.updateCartItem(event.id, event.quantity, event.maxStock, event.productId);

    request.pipe(
      finalize(() => {
        // Eliminar el ID del elemento de la lista de actualizaciones cuando termina
        this.updatingItemIds.update(ids => ids.filter(id => id !== event.id));
      })
    ).subscribe({
      next: () => {
        // Actualizamos el estado local optimisticamente
        this.cartItems.update(items =>
          items.map(item =>
            item.id === event.id ?
              {
                ...item,
                quantity: event.action === 'increment' ? item.quantity + 1 :
                          event.action === 'decrement' ? item.quantity - 1 :
                          event.quantity,
                subtotal: item.unitPrice * (event.action === 'increment' ? item.quantity + 1 :
                                          event.action === 'decrement' ? item.quantity - 1 :
                                          event.quantity)
              } : item
          )
        );
        // Actualizamos el total
        this.updateCartTotal();
      },
      error: (error) => {
        console.error("Error updating cart item", error);
        // Mostramos notificación al usuario
        this.notificationService.error(error.message || "Error al actualizar el carrito");
        // Recargamos el carrito para obtener el estado correcto
        this.cartResource.reload();
      }
    });
  }
  isItemUpdating(itemId: number): boolean {
    return this.updatingItemIds().includes(itemId);
  }
  removeItem(event: { id: number, productId: number }) {
    this.removingItemId.set(event.id);

    this.cartService.removeCartItem(event.id, event.productId).subscribe({
      next: () => {
        setTimeout(() => {
          this.cartItems.update(items => items.filter(item => item.id !== event.id));
          this.removingItemId.set(null);
          this.updateCartTotal();
        }, this.animationDuration);
      },
      error: (error) => {
        console.error("Error removing item from cart", error);
        this.removingItemId.set(null);
        this.cartResource.reload();
      }
    });
  }

  clearCart() {
    this.cartService.removeCleanCart().subscribe({
      next: () => {
        this.cartItems.set([]);
        this.updateCartTotal();
      },
      error: (error) => {
        console.error("Error clearing cart", error);
        this.cartResource.reload();
      }
    });
  }

  private updateCartTotal() {
    const total = this.cartItems().reduce((sum, item) => sum + item.subtotal, 0);
    this.cart.update(cart => cart ? {...cart, total} : null);
  }

  get subtotal(): number {
    return this.cart()?.total || 0;
  }

  isRemoving(id: number): boolean {
    return this.removingItemId() === id;
  }
}
