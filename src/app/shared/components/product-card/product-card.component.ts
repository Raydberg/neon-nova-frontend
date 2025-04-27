import {ChangeDetectionStrategy, Component, Input, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';
import {Products} from '@app/core/interfaces/product-client.interface';
import {CartService} from '@app/core/services/cart.service';
import {finalize} from 'rxjs';


@Component({
  selector: 'product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() product!: Products;

  private cartService = inject(CartService);
  isAddingToCart = false;

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  addToCart(): void {
    if (this.isAddingToCart) return;

    this.isAddingToCart = true;
    this.cartService.addCartShop(this.product.id, 1)
      .pipe(
        finalize(() => {
          this.isAddingToCart = false;
        })
      )
      .subscribe({
        next: () => {
          // Could add a notification/toast here
          console.log(`Added product ${this.product.name} to cart`);
        },
        error: (error) => {
          console.error('Error adding product to cart', error);
        }
      });
  }
}
