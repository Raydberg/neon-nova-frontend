import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { Products } from '@app/core/interfaces/product-client.interface';
import { FavoriteService } from '@app/core/services/favorite.service';
import { NotificationService } from '@app/core/services/notification.service';
import { CartService } from '@app/core/services/cart.service';
import { finalize } from 'rxjs';
import { FavoriteProduct } from '@app/core/interfaces/favotite-http.interface';

@Component({
  selector: 'product-favorite',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ProductCardComponent
  ],
  templateUrl: './product-favorite.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .favorite-item {
      animation: fadeIn 0.5s ease-out forwards;
    }

    .favorite-item:nth-child(1) { animation-delay: 0.05s; }
    .favorite-item:nth-child(2) { animation-delay: 0.1s; }
    .favorite-item:nth-child(3) { animation-delay: 0.15s; }
    .favorite-item:nth-child(4) { animation-delay: 0.2s; }

    .empty-favorites {
      animation: fadeIn 0.5s ease-out forwards;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .btn-remove-all:hover {
      animation: pulse 0.8s infinite;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFavoriteComponent implements OnInit {
  private favoriteService = inject(FavoriteService);
  private notificationService = inject(NotificationService);
  private cartService = inject(CartService);

  isLoading = signal(true);
  isAdding = signal(false);
  isRemoving = signal<number | null>(null);

  // Obtener los productos directamente del servicio
  favoriteProducts = computed(() => {
    return this.favoriteService.favorites();
  });

  // Valores calculados
  hasFavorites = computed(() => this.favoriteProducts().length > 0);

  ngOnInit() {
    // Cargar favoritos desde el servicio
    this.loadFavorites();
  }

  loadFavorites() {
    this.isLoading.set(true);
    this.favoriteService.loadFavorites().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('No se pudieron cargar tus favoritos');
      }
    });
  }

  removeFromFavorites(productId: number) {
    this.isRemoving.set(productId);

    // Buscar el producto antes de eliminarlo para el mensaje
    const product = this.favoriteProducts().find(p => p.id === productId);
    const productName = product?.name || 'Producto';

    this.favoriteService.removeProductFromFavorites(productId)
      .pipe(
        finalize(() => {
          this.isRemoving.set(null);
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.info(`${productName} eliminado de favoritos`);
        },
        error: () => {
          this.notificationService.error('Error al eliminar de favoritos');
        }
      });
  }

  clearAllFavorites() {
    if (this.isAdding()) return;

    if (confirm('¿Estás seguro de eliminar todos tus favoritos?')) {
      this.isLoading.set(true);
      this.favoriteService.clearAllFavorites().subscribe({
        next: () => {
          this.isLoading.set(false);
          this.notificationService.info('Todos los favoritos han sido eliminados');
        },
        error: () => {
          this.isLoading.set(false);
          this.notificationService.error('Error al eliminar todos los favoritos');
        }
      });
    }
  }

  addAllToCart() {
    if (this.isAdding()) return;
    this.isAdding.set(true);

    const products = this.favoriteProducts();
    let added = 0;
    let total = products.length;
    let errors = 0;

    if (total === 0) {
      this.isAdding.set(false);
      return;
    }

    // Añadir productos uno por uno
    for (const product of products) {
      this.cartService.addCartShop(product.id, 1).subscribe({
        next: () => {
          added++;
          if (added + errors === total) {
            this.isAdding.set(false);
            if (errors === 0) {
              this.notificationService.success('Todos los productos fueron agregados al carrito');
            } else {
              this.notificationService.warning(`${added} de ${total} productos fueron agregados al carrito`);
            }
          }
        },
        error: () => {
          errors++;
          if (added + errors === total) {
            this.isAdding.set(false);
            if (errors === total) {
              this.notificationService.error('No se pudo agregar ningún producto al carrito');
            } else {
              this.notificationService.warning(`${added} de ${total} productos fueron agregados al carrito`);
            }
          }
        }
      });
    }
  }
}
