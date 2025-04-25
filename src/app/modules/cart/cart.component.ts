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
        this.cartItems.set(cart.details || []);

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

  updateQuantity(event: { id: number, quantity: number }) {
    if (this.isUpdating()) return;

    this.isUpdating.set(true);
    this.cartService.updateCartItem(event.id, event.quantity)
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
          // Recargamos el carrito para obtener el estado correcto
          this.cartResource.reload();
        }
      });
  }

  removeItem(id: number) {
    this.removingItemId.set(id);

    this.cartService.removeCartItem(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.cartItems.update(items => items.filter(item => item.id !== id));
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

  goBack(): void {
    this.location.back();
  }
}
