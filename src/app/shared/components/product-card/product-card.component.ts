import {ChangeDetectionStrategy, Component, inject, input, signal, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';
import type {Products} from '@app/core/interfaces/product-client.interface';
import {CartService} from '@app/core/services/cart.service';
import {finalize} from 'rxjs';
import {NotificationService} from '@core/services/notification.service';
import {AuthService} from '@app/core/services/auth.service';
import {FavoriteService} from '@app/core/services/favorite.service';

@Component({
  selector: 'product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent implements OnInit {
  product = input<Products>();

  private cartService = inject(CartService);
  private favoriteService = inject(FavoriteService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isAddingToCart = signal(false);
  isFavorite = signal(false);
  isTogglingFavorite = signal(false);

  ngOnInit(): void {
    // Verificar si el producto es favorito al inicializar
    this.checkIfFavorite();
  }

  private checkIfFavorite(): void {
    const productId = this.product()?.id;
    if (productId && this.authService.isLoggedIn()) {
      // Primero intentamos con la caché local
      if (this.favoriteService.isFavorite(productId)) {
        this.isFavorite.set(true);
      } else {
        // Si no está en la caché, consultamos al API
        this.favoriteService.checkIsFavorite(productId).subscribe(isFav => {
          this.isFavorite.set(isFav);
        });
      }
    }
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.notificationService.warning('Debes iniciar sesión para añadir productos a favoritos');
      const currentUrl = this.router.url;
      this.router.navigate(['/auth/login'], {
        queryParams: {returnUrl: currentUrl}
      });
      return;
    }

    if (this.isTogglingFavorite()) return;

    const productId = this.product()?.id;
    if (!productId) return;

    this.isTogglingFavorite.set(true);

    this.favoriteService.toggleFavorite(productId)
      .pipe(
        finalize(() => {
          this.isTogglingFavorite.set(false);
        })
      )
      .subscribe({
        next: (isFavorite) => {
          this.isFavorite.set(isFavorite);
          if (isFavorite) {
            this.notificationService.success(`${this.product()?.name} añadido a favoritos`);
          } else {
            this.notificationService.info(`${this.product()?.name} eliminado de favoritos`);
          }
        },
        error: (error) => {
          console.error('Error toggling favorite', error);
          this.notificationService.error(`No se pudo cambiar el estado de favorito: ${error.message || 'Error desconocido'}`);
        }
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
