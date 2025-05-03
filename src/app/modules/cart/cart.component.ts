import {ChangeDetectionStrategy, Component, effect, inject, OnInit, signal} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {RouterModule} from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';
import {CartItemComponent} from './cart-item/cart-item.component';
import {CartSummaryComponent} from './cart-summary/cart-summary.component';
import {CartService} from '@app/core/services/cart.service';
import {rxResource} from '@angular/core/rxjs-interop';
import {finalize} from 'rxjs';
import {CartShopClient, Detail} from '@app/core/models/cart-shop.model';
import {NotificationService} from '@core/services/notification.service';


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

  // Resource para cargar datos del carrito
  cartResource = rxResource({
    loader: () => this.cartService.getAllCartShop()
  });

  cart = signal<CartShopClient | null>(null);
  cartItems = signal<Detail[]>([]); // Usamos Detail de cart-shop.model.ts
  removingItemId = signal<number | null>(null);
  isUpdating = signal(false);

  animationDuration = 500;

  constructor() {
    // Utilizamos un efecto para actualizar los datos cuando cartResource cambie
    effect(() => {
      const result = this.cartResource.value();
      console.log('Raw cart response:', result);

      // Verificamos si tenemos un objeto con la propiedad details
      if (result && result.details) {
        // Ya tenemos el carrito directamente
        const cart = result;

        // Actualizamos el estado local
        this.cart.set(cart);

        // Modificamos esta parte para garantizar que stock nunca sea undefined
        // Si el valor es undefined, asignamos 0 u otro valor por defecto
        const cartItems = cart.details.map(item => ({
          ...item,
          stock: item.stock ?? 0 // Usando el operador nullish coalescing
        }));

        this.cartItems.set(cartItems); // Ahora no necesitas el cast pues todos los campos coinciden
        console.log('Cart details:', cart.details);
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

  updateQuantity(event: { id: number, quantity: number, productId: number, maxStock?: number }) {
    if (this.isUpdating()) return;

    this.isUpdating.set(true);
    this.cartService.updateCartItem(event.id, event.quantity, event.maxStock, event.productId)
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: () => {
          // Actualizamos el estado local optimisticamente
          this.cartItems.update(items =>
            items.map(item =>
              item.id === event.id ?
                {
                  ...item,
                  quantity: event.quantity,
                  subtotal: item.unitPrice * event.quantity
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
