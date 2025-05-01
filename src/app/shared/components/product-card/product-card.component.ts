import {ChangeDetectionStrategy, Component, inject, input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';
import type {Products} from '@app/core/interfaces/product-client.interface';
import {CartService} from '@app/core/services/cart.service';
import {finalize} from 'rxjs';
import {NotificationService} from '@core/services/notification.service';
import {AuthService} from '@app/core/services/auth.service';


@Component({
  selector: 'product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  product = input<Products>();

  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isAddingToCart = signal(false);

  formatPrice(price: number): string {
    return price.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.warning('Debes iniciar sesión para añadir productos al carrito');
      const currentUrl = this.router.url;
      this.router.navigate(['/auth/login'], {
        queryParams: {returnUrl: currentUrl}
      });

      return;
    }

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
