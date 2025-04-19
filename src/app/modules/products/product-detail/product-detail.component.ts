import {ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, effect} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';
import {ProductCardComponent} from '@shared/components/product-card/product-card.component';
import {ProductService} from '@app/core/services/product.service';
import {ProductByComments, Comment, Image} from '@app/core/interfaces/product-by-comments.interface';
import {Products} from '@app/core/interfaces/product-client.interface';
import {rxResource} from '@angular/core/rxjs-interop';
import {catchError, of, throwError} from 'rxjs';

@Component({
  selector: 'product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ProductCardComponent
  ],
  templateUrl: './product-detail.component.html',
  styles: [`
    /* Animación para la galería de imágenes */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .fade-in {
      animation: fadeIn 0.3s ease-in-out forwards;
    }

    /* Animación para los botones */
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .btn-add-to-cart:hover {
      animation: pulse 0.8s infinite;
    }

    /* Animación para tabs */
    .tab-content {
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease-out;
    }

    .tab-content.active {
      opacity: 1;
      transform: translateY(0);
    }

    /* Animación para miniaturas */
    .thumbnail {
      transition: all 0.2s ease;
    }

    .thumbnail:hover {
      transform: scale(1.05);
      box-shadow: 0 0 0 2px hsl(var(--p));
    }

    .thumbnail.active {
      box-shadow: 0 0 0 2px hsl(var(--p));
      transform: scale(1.05);
    }

    /* Animación para zoom en imagen principal */
    .main-image-container {
      overflow: hidden;
    }

    .main-image {
      transition: transform 0.3s ease;
    }

    .main-image:hover {
      transform: scale(1.05);
    }

    /* Animaciones para reviews */
    .review-item {
      opacity: 0;
      transform: translateY(20px);
      animation: slideUp 0.5s ease forwards;
    }

    @keyframes slideUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .review-item:nth-child(1) { animation-delay: 0.1s; }
    .review-item:nth-child(2) { animation-delay: 0.2s; }
    .review-item:nth-child(3) { animation-delay: 0.3s; }
    .review-item:nth-child(4) { animation-delay: 0.4s; }
    .review-item:nth-child(5) { animation-delay: 0.5s; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  // Services
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  // Local state
  quantity = signal(1);
  currentImageIndex = signal(0);
  activeTab = signal('opiniones'); // Start with comments tab active for testing
  commentsPage = signal(1);
  commentsPageSize = signal(5);
  productId = signal<number | null>(null);

  // Product data resource
  productResource = rxResource<ProductByComments | null, {
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
      ).pipe(
        catchError(error => {
          console.error('Error loading product details:', error);
          return throwError(() => new Error(`Error al cargar el producto: ${error.message || 'Error desconocido'}`));
        })
      );
    }
  });

  // Related products
  relatedProducts = signal<Products[]>([]);

  // Computed values
  product = computed(() => this.productResource.value());

  isLoading = computed(() => this.productResource.isLoading());

  error = computed(() => this.productResource.error());

  rating = computed(() => {
    return this.product()?.punctuation || 0;
  });

  imageUrls = computed<string[]>(() => {
    const product = this.product();
    if (!product || !product.images) return [];
    return product.images.map(img => img.imageUrl || '');
  });

  comments = computed<Comment[]>(() => {
    const productData = this.product();
    if (!productData) return [];
    console.log(`Comments loaded: ${productData.comments?.length || 0}`, productData.comments);
    return productData.comments || [];
  });

  totalCommentsCount = computed(() => {
    return this.product()?.totalCommentsCount || 0;
  });

  ngOnInit(): void {
    // Get product ID from route and load product
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const productIdNum = Number(id);
        this.productId.set(productIdNum);
        // The resource will automatically reload due to the request dependency
      }
    });

    // Use effect to load related products when we have the product data
    effect(() => {
      const product = this.product();
      if (product?.category?.id) {
        this.loadRelatedProducts(product.category.id);
      }
    });
  }

  // UI methods
  setActiveTab(tabId: string): void {
    console.log(`Activating tab: ${tabId}`);
    this.activeTab.set(tabId);
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

  nextImage(): void {
    const images = this.imageUrls();
    if (images.length > 0) {
      this.currentImageIndex.update(idx =>
        idx === images.length - 1 ? 0 : idx + 1
      );
    }
  }

  prevImage(): void {
    const images = this.imageUrls();
    if (images.length > 0) {
      this.currentImageIndex.update(idx =>
        idx === 0 ? images.length - 1 : idx - 1
      );
    }
  }

  setImage(index: number): void {
    this.currentImageIndex.set(index);
  }

  addToCart(): void {
    console.log(`Added ${this.quantity()} units of product ${this.product()?.id} to cart`);
  }

  buyNow(): void {
    console.log(`Buy now ${this.quantity()} units of product ${this.product()?.id}`);
  }

  loadRelatedProducts(categoryId: number): void {
    this.productService.getProductsByCategoryWithFirstImage(
      categoryId, 1, 4
    ).subscribe(response => {
      this.relatedProducts.set(response.items);
    });
  }

  // Helper for star ratings
  ratingToArray(rating: number): number[] {
    const result = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      result.push(1);
    }

    // Half star if needed
    if (hasHalfStar) {
      result.push(0.5);
    }

    // Empty stars
    while (result.length < 5) {
      result.push(0);
    }

    return result;
  }

  getPageNumbers(): number[] {
    const totalPages = this.product()?.commentsTotalPages || 0;
    return Array.from({length: totalPages}, (_, i) => i + 1);
  }

  loadCommentPage(page: number): void {
    if (this.commentsPage() === page) return;
    this.commentsPage.set(page);
  }

  // Safe access methods
  getCommentsPageNumber(): number {
    return this.product()?.commentsPageNumber || 1;
  }

  getCommentsTotalPages(): number {
    return this.product()?.commentsTotalPages || 1;
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

  debugState(): void {
    console.log({
      activeTab: this.activeTab(),
      commentsLength: this.comments().length,
      commentsPageNumber: this.getCommentsPageNumber(),
      commentsTotalPages: this.getCommentsTotalPages(),
      totalCommentsCount: this.totalCommentsCount(),
      isLoading: this.isLoading(),
      product: this.product()
    });
  }
}
