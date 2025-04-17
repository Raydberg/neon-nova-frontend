import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CartItem } from '../../cart/cart-item/cart-item.component';

@Component({
  selector: 'checkout-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './confirmation.component.html',
  styles: [`
    .confirmation-icon {
      animation: successPulse 1s ease;
    }

    @keyframes successPulse {
      0% { transform: scale(0.8); opacity: 0; }
      70% { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }

    .order-details {
      animation: fadeInUp 0.7s ease-out forwards;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .order-item {
      transition: all 0.2s ease;
    }

    .order-item:hover {
      background-color: rgba(var(--b2), 0.05);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationComponent {
  // Datos del pedido confirmado
  orderNumber = signal('NN-12345');
  orderDate = signal(new Date());
  estimatedDelivery = signal(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)); // 5 días después

  // Datos simulados del carrito
  orderItems = signal<CartItem[]>([
    {
      id: 1,
      producto_id: 1,
      nombre: "Laptop Pro X",
      precio: 1299.99,
      cantidad: 1,
      imagen: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
    },
    {
      id: 2,
      producto_id: 3,
      nombre: "Auriculares Noise Cancel",
      precio: 249.99,
      cantidad: 2,
      imagen: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
    }
  ]);

  // Cálculos para el resumen
  get subtotal(): number {
    return this.orderItems().reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  get shipping(): number {
    return 9.99;
  }

  get total(): number {
    return this.subtotal + this.shipping;
  }

  // Método para formatear precio
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  // Formatear fecha
  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
