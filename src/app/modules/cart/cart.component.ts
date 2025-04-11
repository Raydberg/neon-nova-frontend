import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ShoppingCart, ArrowLeft } from 'lucide-angular';
import { CartItemComponent, CartItem } from './cart-item/cart-item.component';
import { CartSummaryComponent } from './cart-summary/cart-summary.component';

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
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    :host {
      display: block;
      animation: fadeIn 0.4s ease-out;
    }

    .empty-cart {
      transition: all 0.3s ease;
    }

    .empty-cart:hover .cart-icon {
      transform: scale(1.1) rotate(5deg);
      transition: transform 0.4s ease;
    }

    .cart-icon {
      transition: transform 0.4s ease;
    }

    /* Animación para eliminar elementos */
    @keyframes removingItem {
      0% { opacity: 1; transform: scale(1); }
      20% { opacity: 1; transform: scale(1.02); }
      100% { opacity: 0; transform: scale(0.95); height: 0; margin: 0; padding: 0; }
    }

    .removing-item {
      animation: removingItem 0.5s forwards;
      overflow: hidden;
    }

    /* Animación cuando se añade un nuevo item */
    @keyframes addingItem {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .adding-item {
      animation: addingItem 0.5s forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent implements OnInit {
  // Iconos
  readonly ShoppingCartIcon = ShoppingCart;
  readonly ArrowLeftIcon = ArrowLeft;

  // Estado del carrito usando señales
  cartItems = signal<CartItem[]>([]);
  removingItemId = signal<number | null>(null);

  // Para aplicar animación cuando se elimina un item
  animationDuration = 500; // ms

  ngOnInit() {
    // Simulación de carga de datos
    setTimeout(() => {
      this.loadCartItems();
    }, 300);
  }

  private loadCartItems() {
    // Esto se reemplazaría por una llamada a un servicio real
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

  // Manejo de cambios en la cantidad
  updateQuantity(event: {id: number, quantity: number}) {
    this.cartItems.update(items =>
      items.map(item =>
        item.id === event.id ? { ...item, cantidad: event.quantity } : item
      )
    );
  }

  // Eliminar item del carrito
  removeItem(id: number) {
    this.removingItemId.set(id);

    // Esperar a que termine la animación antes de eliminar realmente el item
    setTimeout(() => {
      this.cartItems.update(items => items.filter(item => item.id !== id));
      this.removingItemId.set(null);
    }, this.animationDuration);
  }

  // Calcular subtotal
  get subtotal(): number {
    return this.cartItems().reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  // Para animaciones condicionales
  isRemoving(id: number): boolean {
    return this.removingItemId() === id;
  }
}
