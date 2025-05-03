import {ChangeDetectionStrategy, Component, computed, effect, inject, input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';
import type {ProductByComments} from '@app/core/interfaces/product-by-comments.interface';
import type {Products} from '@app/core/interfaces/product-client.interface';
import {Renderer2} from '@angular/core';
import {RatingDisplayComponent} from '../rating-display/rating-display.component';
import {CartService} from '@app/core/services/cart.service';
import {NotificationService} from '@core/services/notification.service';
import {Router} from '@angular/router';
import {AuthService} from '@app/core/services/auth.service';
import {finalize, Subscription} from 'rxjs';
import {CurrencyPENPipe} from '@shared/pipes/currency-pen.pipe';
import {FavoriteService} from '@core/services/favorite.service';

interface Favorite {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  addedAt: string;
}

@Component({
  selector: 'product-info',
  imports: [CommonModule, CurrencyPENPipe,FormsModule, LucideAngularModule, RatingDisplayComponent],
  templateUrl: './product-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductInfoComponent {
  private readonly renderer = inject(Renderer2);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private favoriteService = inject(FavoriteService)

  product = input.required<ProductByComments>();
  relatedProducts = input<Products[]>([]);

  quantity = signal(1);
  isFavorite = signal(false);
  isAddingToCart = signal(false);

  // Nuevo signal para mantener el stock disponible
  availableStock = signal<number>(0);
  // Cantidad ya en el carrito
  quantityInCart = signal<number>(0);

  // Stock total menos lo que ya está en el carrito
  effectiveAvailableStock = computed(() => {
    return this.product()?.stock ? this.product().stock - this.quantityInCart() : 0;
  });

  protected rating = computed(() => this.product()?.punctuation || 0);

  private cartChangesSubscription: Subscription;

  constructor() {
    // 1. Efecto para cargar datos iniciales
    effect(() => {
      const currentProduct = this.product();
      if (currentProduct?.id) {
        this.checkIfProductIsFavorite(currentProduct.id);
        this.updateAvailableStock(currentProduct.id, currentProduct.stock);
        this.updateQuantityInCart(currentProduct.id);
      }
    });

    // 2. Suscripción a cambios en el carrito
    this.cartChangesSubscription = this.cartService.cartChanges$.subscribe(() => {
      const currentProduct = this.product();
      if (currentProduct?.id) {
        // Actualizamos la cantidad en el carrito cuando cambia el carrito
        this.updateQuantityInCart(currentProduct.id);
      }
    });
  }

  ngOnDestroy() {
    // Limpiar suscripción al destruir el componente
    if (this.cartChangesSubscription) {
      this.cartChangesSubscription.unsubscribe();
    }
  }

  private updateAvailableStock(productId: number, totalStock: number): void {
    this.availableStock.set(totalStock);
    this.cartService.getAvailableStock(productId, totalStock).subscribe(stock => {
      this.availableStock.set(stock);
    });
  }

  private updateQuantityInCart(productId: number): void {
    this.quantityInCart.set(this.cartService.getProductQuantityInCart(productId));
  }

  private checkIfProductIsFavorite(productId: number): void {
    if (this.authService.isLoggedIn()) {
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

  private getFavorites(): Favorite[] {
    const storedFavorites = localStorage.getItem('favorites');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  increaseQuantity(): void {
    // Ahora usamos el effectiveAvailableStock
    if (this.quantity() < this.effectiveAvailableStock()) {
      this.quantity.update(q => q + 1);
    } else {
      this.notificationService.warning(`Solo hay ${this.effectiveAvailableStock()} unidades disponibles de este producto`);
    }
  }

  addToCart(): void {
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      this.notificationService.warning('Debes iniciar sesión para añadir productos al carrito');
      const currentUrl = this.router.url;
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: currentUrl }
      });
      return;
    }

    // Evitar múltiples clicks mientras se procesa
    if (this.isAddingToCart()) return;

    const currentProduct = this.product();
    if (!currentProduct?.id) return;

    // Verificar si hay suficiente stock
    if (this.quantity() > this.effectiveAvailableStock()) {
      this.notificationService.error(`No hay suficiente stock disponible. Solo quedan ${this.effectiveAvailableStock()} unidades.`);
      return;
    }

    this.isAddingToCart.set(true);

    // Llamar al servicio para añadir al carrito - ahora pasamos el stock máximo
    this.cartService.addCartShop(currentProduct.id, this.quantity(), currentProduct.stock)
      .pipe(
        finalize(() => {
          this.isAddingToCart.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.success(`${this.quantity()} ${this.quantity() > 1 ? 'unidades' : 'unidad'} de ${currentProduct.name} ${this.quantity() > 1 ? 'agregadas' : 'agregada'} al carrito`);

          // Actualizar la cantidad en el carrito
          this.updateQuantityInCart(currentProduct.id);

          // Restablecer la cantidad seleccionada a 1
          this.quantity.set(1);
        },
        error: (error) => {
          console.error('Error adding product to cart', error);
          this.notificationService.error(`No se pudo agregar al carrito: ${error.message || 'Error desconocido'}`);
        }
      });
  }

  buyNow(): void {
    // Primero añadimos al carrito
    this.addToCart();
    // Y después navegamos al checkout
    setTimeout(() => {
      if (!this.isAddingToCart()) {
        this.router.navigate(['/cart']);
      }
    }, 500);
  }


  toggleFavorite(event: MouseEvent): void {
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      this.notificationService.warning('Debes iniciar sesión para añadir productos a favoritos');
      const currentUrl = this.router.url;
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: currentUrl }
      });
      return;
    }

    const currentProduct = this.product();
    if (!currentProduct?.id) return;

    // Usar el servicio para alternar el estado
    this.favoriteService.toggleFavorite(currentProduct.id).subscribe({
      next: (isFavorite) => {
        this.isFavorite.set(isFavorite);
        if (isFavorite) {
          this.notificationService.success(`${currentProduct.name} añadido a favoritos`);
          this.createSplashAnimation(event);
        } else {
          this.notificationService.info(`${currentProduct.name} eliminado de favoritos`);
        }
      },
      error: (error) => {
        console.error('Error al alternar favorito:', error);
        this.notificationService.error('No se pudo cambiar el estado de favorito');
      }
    });
  }

  getCategoryName(): string {
    return this.product()?.category?.name || '';
  }

  getProductStock(): number {
    return this.effectiveAvailableStock();
  }

  getProductName(): string {
    return this.product()?.name || '';
  }

  getProductDescription(): string {
    return this.product()?.description || '';
  }

  private createSplashAnimation(event: MouseEvent): void {
    const splash = this.renderer.createElement('div');
    this.renderer.addClass(splash, 'heart-splash');

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    this.renderer.setStyle(splash, 'left', `${offsetX}px`);
    this.renderer.setStyle(splash, 'top', `${offsetY}px`);
    this.renderer.appendChild(event.target, splash);

    setTimeout(() => {
      if (splash.parentNode) {
        this.renderer.removeChild(splash.parentNode, splash);
      }
    }, 700);
  }

}
