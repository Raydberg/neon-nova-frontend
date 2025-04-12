import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ShoppingCart, ArrowLeft } from 'lucide-angular';
import { CartItemComponent, CartItem } from './cart-item/cart-item.component';
import { CartSummaryComponent } from './cart-summary/cart-summary.component';

@Component({
  selector: 'app-cart',
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
  // Iconos
  readonly ShoppingCartIcon = ShoppingCart;
  readonly ArrowLeftIcon = ArrowLeft;
  private location = inject(Location);
  cartItems = signal<CartItem[]>([]);
  removingItemId = signal<number | null>(null);

  animationDuration = 500;

  ngOnInit() {
    setTimeout(() => {
      this.loadCartItems();
    }, 300);
  }

  private loadCartItems() {
    const items: CartItem[] = [
      {
        id: 1,
        producto_id: 1,
        nombre: "Laptop Pro X",
        precio: 1299.99,
        cantidad: 1,
        imagen: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80"
      },
      {
        id: 2,
        producto_id: 3,
        nombre: "Auriculares Noise Cancel",
        precio: 249.99,
        cantidad: 2,
        imagen: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1165&q=80"
      }
    ];

    this.cartItems.set(items);
  }

  updateQuantity(event: { id: number, quantity: number }) {
    this.cartItems.update(items =>
      items.map(item =>
        item.id === event.id ? { ...item, cantidad: event.quantity } : item
      )
    );
  }

  removeItem(id: number) {
    this.removingItemId.set(id);

    setTimeout(() => {
      this.cartItems.update(items => items.filter(item => item.id !== id));
      this.removingItemId.set(null);
    }, this.animationDuration);
  }

  get subtotal(): number {
    return this.cartItems().reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  isRemoving(id: number): boolean {
    return this.removingItemId() === id;
  }

  goBack(): void {
    this.location.back();
  }
}
