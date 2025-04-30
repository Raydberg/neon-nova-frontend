import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import type { ProductByComments } from '@app/core/interfaces/product-by-comments.interface';

@Component({
  selector: 'product-gallery',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './product-gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGalleryComponent {
  product = input.required<ProductByComments | null>();

  currentImageIndex = signal(0);

  get imageUrls(): string[] {
    const product = this.product();
    if (!product?.images?.length) return [];
    return product.images.map(img => img.imageUrl || '');
  }

  nextImage(): void {
    const images = this.imageUrls;
    if (images.length > 0) {
      this.currentImageIndex.update(idx => (idx === images.length - 1) ? 0 : idx + 1);
    }
  }

  prevImage(): void {
    const images = this.imageUrls;
    if (images.length > 0) {
      this.currentImageIndex.update(idx => (idx === 0) ? images.length - 1 : idx - 1);
    }
  }

  setImage(index: number): void {
    this.currentImageIndex.set(index);
  }

  getProductName(): string {
    return this.product()?.name || '';
  }
}
