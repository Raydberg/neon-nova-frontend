import {ChangeDetectionStrategy, Component, inject, signal, computed, effect} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';
import {ProductService} from '@app/core/services/product.service';
import type {ProductByComments} from '@app/core/interfaces/product-by-comments.interface';
import type {Products} from '@app/core/interfaces/product-client.interface';
import {rxResource, toSignal} from '@angular/core/rxjs-interop';
import {of} from 'rxjs';
import {ProductGalleryComponent} from '@modules/products/product-detail/product-gallery/product-gallery.component';
import {ProductInfoComponent} from '@modules/products/product-detail/product-info/product-info.component';
import {CommentsSectionComponent} from '@modules/products/product-detail/comment-section/comments-section.component';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'product-detail',
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ProductGalleryComponent,
    ProductInfoComponent,
    CommentsSectionComponent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  private readonly routeParams = toSignal(this.route.paramMap);

  protected readonly productId = signal<number | null>(null);
  protected readonly commentsPage = signal(1);
  protected readonly commentsPageSize = signal(5);
  protected readonly relatedProducts = signal<Products[]>([]);

  protected readonly productResource = rxResource<ProductByComments | null, {
    productId: number | null;
    commentsPage: number;
    commentsPageSize: number;
  }>({
    request: () => ({
      productId: this.productId(),
      commentsPage: this.commentsPage(),
      commentsPageSize: this.commentsPageSize()
    }),
    loader: ({request}) => {
      if (!request.productId) return of(null);

      return this.productService.getProductWithComments(
        request.productId,
        request.commentsPage,
        request.commentsPageSize
      )
    }
  });

  constructor() {
    effect(() => {
      const productValue = this.productResource.value();
      if (productValue?.category?.id) {
        this.loadRelatedProducts(productValue.category.id);
      }
    });

    effect(() => {
      const params = this.routeParams();
      if (!params) return;

      const id = params.get('id');
      if (id && !isNaN(Number(id))) {
        this.productId.set(Number(id));
      }
    });
  }

  private loadRelatedProducts(categoryId: number): void {
    // Should use a different method to get products by category
    this.productService.getProductsByCategoryWithFirstImage(categoryId, 1, 4)
      .subscribe({
        next: response => {
          if (response && response.items) {
            // Filter out the current product from related products
            const currentProductId = this.productId();
            const filtered = response.items.filter(p => p.id !== currentProductId);
            this.relatedProducts.set(filtered.slice(0, 4));
          }
        },
        error: error => console.error('Error cargando productos relacionados:', error)
      });
  }

  protected handleCommentPageChange(page: number): void {
    if (this.commentsPage() === page) return;
    this.commentsPage.set(page);
  }

  // Método para recargar los comentarios cuando se añade uno nuevo
  protected handleCommentAdded(): void {
    // Reiniciamos la página a 1 y forzamos una recarga de los comentarios
    this.commentsPage.set(1);
    this.productResource.reload();
  }
}
