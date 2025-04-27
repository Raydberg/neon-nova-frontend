import {ChangeDetectionStrategy, Component, inject, signal, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';
import {CartService} from '@app/core/services/cart.service';
import {rxResource} from '@angular/core/rxjs-interop';

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
      0% {
        transform: scale(0.8);
        opacity: 0;
      }
      70% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .order-details {
      animation: fadeInUp 0.7s ease-out forwards;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
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
export class ConfirmationComponent implements OnInit {
  private cartService = inject(CartService);

  // Datos del pedido confirmado
  orderNumber = signal(`NN-${Math.floor(Math.random() * 90000) + 10000}`);
  orderDate = signal(new Date());
  estimatedDelivery = signal(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)); // 5 días después
  email = signal('usuario@email.com');

  // Cart resource para cargar datos del carrito
  cartResource = rxResource({
    loader: () => {
      return this.cartService.getAllCartShop()
    }
  });

  // Datos del carrito
  cartItems = signal<any[]>([]);
  subtotal = signal(0);
  shipping = signal(9.99);
  total = signal(0);

  ngOnInit() {
    const result = this.cartResource.value();
    // this.cartResource.result$.subscribe(result =>
    // if (result.status === 'success' && result.data.length > 0) {
    //   const cart = result.data[0];
    //
    //   this.cartItems.set(cart.details || []);
    //   this.subtotal.set(cart.total);
    //   this.shipping.set(cart.total > 1000 ? 0 : 9.99);
    //   this.total.set(cart.total + this.shipping());
    //
    //   // Al confirmar el pedido podríamos limpiar el carrito
    //   // this.cartService.removeCleanCart().subscribe();
    // }


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
