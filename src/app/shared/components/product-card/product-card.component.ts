import {ChangeDetectionStrategy, Component, Input, inject, input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';
import type {Products} from '@app/core/interfaces/product-client.interface';
import {CartService} from '@app/core/services/cart.service';
import {finalize} from 'rxjs';


@Component({
  selector: 'product-card',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  product= input<Products>() ;

  private cartService = inject(CartService);
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
          console.log(`Added product ${this.product()?.name} to cart`);
        },
        error: (error) => {
          console.error('Error adding product to cart', error);
        }
      });
  }
}
