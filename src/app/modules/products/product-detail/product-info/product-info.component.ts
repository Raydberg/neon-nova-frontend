import {ChangeDetectionStrategy, Component, computed, effect, inject, input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';
import type {ProductByComments} from '@app/core/interfaces/product-by-comments.interface';
import type {Products} from '@app/core/interfaces/product-client.interface';
import {Renderer2} from '@angular/core';
import {RatingDisplayComponent} from '../rating-display/rating-display.component';

interface Favorite {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  addedAt: string;
}

@Component({
  selector: 'product-info',
  imports: [CommonModule, FormsModule, LucideAngularModule, RatingDisplayComponent],
  templateUrl: './product-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductInfoComponent {
  private readonly renderer = inject(Renderer2);

  product = input.required<ProductByComments>();
  relatedProducts = input<Products[]>([]);

  quantity = signal(1);
  isFavorite = signal(false);

  protected rating = computed(() => this.product()?.punctuation || 0);

  constructor() {
    effect(() => {
      const currentProduct = this.product();
      if (currentProduct?.id) {
        this.checkIfProductIsFavorite(currentProduct.id);
      }
    });
  }

  private checkIfProductIsFavorite(productId: number): void {
    const favorites = this.getFavorites();
    this.isFavorite.set(favorites.some(fav => fav.id === productId));
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
    const maxStock = this.product()?.stock || 1;
    if (this.quantity() < maxStock) {
      this.quantity.update(q => q + 1);
    }
  }

  addToCart(): void {
    console.log(`Added ${this.quantity()} units of product ${this.product()?.id} to cart`);
  }

  buyNow(): void {
    console.log(`Buy now ${this.quantity()} units of product ${this.product()?.id}`);
  }

  toggleFavorite(event: MouseEvent): void {
    const currentProduct = this.product();
    if (!currentProduct) return;

    const newState = !this.isFavorite();
    this.isFavorite.set(newState);

    const favorites = this.getFavorites();

    if (newState) {
      if (!favorites.some(fav => fav.id === currentProduct.id)) {
        favorites.push({
          id: currentProduct.id,
          name: currentProduct.name,
          price: currentProduct.price,
          imageUrl: currentProduct.images?.[0]?.imageUrl || '',
          addedAt: new Date().toISOString()
        });
        this.createSplashAnimation(event);
      }
    } else {
      const index = favorites.findIndex(fav => fav.id === currentProduct.id);
      if (index !== -1) {
        favorites.splice(index, 1);
      }
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  getCategoryName(): string {
    return this.product()?.category?.name || '';
  }

  getProductStock(): number {
    return this.product()?.stock || 0;
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
