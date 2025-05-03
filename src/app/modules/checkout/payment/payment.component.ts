import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CartService } from '@app/core/services/cart.service';
import { CheckoutService } from '@app/core/services/checkout.service';
import { finalize, switchMap } from 'rxjs';
import { PaymentRequest, LineItem } from '@app/core/interfaces/checkout-http.interface';
import { CartShopClient } from '@app/core/models/cart-shop.model';
import { rxResource } from '@angular/core/rxjs-interop';
import { CurrencyPENPipe } from '@shared/pipes/currency-pen.pipe';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'checkout-payment',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    CurrencyPENPipe,
    RouterLink
  ],
  templateUrl: './payment.component.html',
  styles: [`
    .payment-summary {
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .payment-item {
      transition: all 0.2s ease;
    }

    .payment-item:hover {
      background-color: rgba(var(--b2), 0.05);
    }

    .pay-btn {
      position: relative;
      overflow: hidden;
    }

    .pay-btn::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transform: translateX(-100%);
    }

    .pay-btn:hover:not(:disabled)::after {
      transform: translateX(100%);
      transition: transform 0.8s ease;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent implements OnInit {
  // Injections
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);

  // State signals
  isProcessing = signal(false);

  // Email y teléfono guardados en shipping
  customerEmail = signal(localStorage.getItem('checkout_email') || 'cliente@example.com');
  customerPhone = signal(localStorage.getItem('checkout_phone') || '123456789');

  // Costo de envío
  shippingCost = signal(parseFloat(localStorage.getItem('checkout_shipping_cost') || '9.99'));

  // Cart data
  cartResource = rxResource({
    loader: () => this.cartService.getAllCartShop()
  });

  ngOnInit(): void {
    // Cargar datos del carrito al iniciar
    this.cartResource.reload();
  }

  // Método para obtener el subtotal
  getSubtotal(): number {
    return this.cartResource.value()?.total || 0;
  }

  // Método para obtener el total con envío
  getTotal(): number {
    return this.getSubtotal() + this.shippingCost();
  }

  // Procesar el pago y enviar a Stripe
  proceedToPayment(): void {
    if (this.isProcessing()) return;

    this.isProcessing.set(true);

    // Obtenemos los datos del carrito
    this.cartService.getAllCartShop()
      .pipe(
        switchMap((cart: CartShopClient) => {
          // Preparamos los datos del carrito para el formato que espera la API de Stripe
          const lineItems: LineItem[] = cart.details.map(item => ({
            priceData: {
              currency: 'usd', // Moneda en minúsculas como requiere Stripe
              productData: {
                name: item.productName,
                metadata: {
                  productId: item.productId.toString()
                }
              },
              unitAmount: Math.round(item.unitPrice * 100) // Precio en centavos para Stripe
            },
            quantity: item.quantity
          }));

          // Costo de envío (en centavos)
          const shippingCostInCents = Math.round(this.shippingCost() * 100);

          // Creamos el objeto de petición
          const paymentData: PaymentRequest = {
            lineItems,
            currency: 'usd',
            shippingCost: shippingCostInCents,
            customerEmail: this.customerEmail(),
            customerPhone: this.customerPhone()
          };

          console.log('Sending payment data:', paymentData);
          return this.checkoutService.processPayment(paymentData);
        }),
        finalize(() => this.isProcessing.set(false))
      )
      .subscribe({
        next: (response) => {
          console.log('Payment processed successfully, redirecting to Stripe:', response);

          // Si tenemos una URL de redirección de Stripe, navegar a ella
          if (response && response.url) {
            window.location.href = response.url; // Redirección a Stripe
          } else {
            // Fallback si no hay URL proporcionada
            this.notificationService.success('Pago procesado correctamente');
            this.router.navigate(['/checkout/confirmation']);
          }
        },
        error: (error) => {
          console.error('Error al procesar el pago:', error);
          this.notificationService.error('Error al procesar el pago: ' + (error.message || 'Por favor, intenta nuevamente'));
        }
      });
  }
}
