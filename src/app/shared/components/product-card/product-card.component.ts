import {ChangeDetectionStrategy, Component, Input, inject, input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';
import type {Products} from '@app/core/interfaces/product-client.interface';
import {CartService} from '@app/core/services/cart.service';
import {finalize} from 'rxjs';
import {NotificationService} from '@core/services/notification.service';


@Component({
  selector: 'product-card',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  product = input<Products>();

  private cartService = inject(CartService);
  private notificationService = inject(NotificationService)
  isAddingToCart = signal(false);

  formatPrice(price: number): string {
    return price.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  addToCart(): void {
    if (this.isAddingToCart()) return;

    const productId = this.product()?.id;
    if (!productId) return;

    this.isAddingToCart.set(true);

    this.cartService.addCartShop(productId, 1)
      .pipe(
        finalize(() => {
          this.isAddingToCart.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.success(`${this.product()?.name} agregado al carrito`);
        },
        error: (error) => {
          console.error('Error adding product to cart', error);
          this.notificationService.error(`No se pudo agregar al carrito: ${error.message || 'Error desconocido'}`);
        }
      });
  }
}
