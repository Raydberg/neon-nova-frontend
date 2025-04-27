import {ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, effect, Renderer2} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
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
    // ProductCardComponent
  ],
  templateUrl: './product-detail.component.html',
  styles: [`
    /* Animación para la galería de imágenes */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .fade-in {
      animation: fadeIn 0.3s ease-in-out forwards;
    }

    /* Animación para los botones */
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
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

   /* Estilos mejorados para el botón de corazón */
.heart-button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  transition: all 0.3s ease;
  background-color: transparent;
  cursor: pointer;
  border: 1px solid transparent;
  position: relative;
  z-index: 5;
}

.heart-button:hover {
  background-color: rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.heart-button.active {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

/* Contenedor del corazón */
.heart-container {
  position: relative;
  width: 2rem;
  height: 2rem;
}

/* Relleno del corazón */
.heart-fill {
  position: absolute;
  inset: 0;
  opacity: 1;
}

/* Animación de latido */
@keyframes heartbeat {
  0% { transform: scale(1); }
  15% { transform: scale(1.2); }
  30% { transform: scale(1); }
  45% { transform: scale(1.1); }
  60% { transform: scale(1); }
}

.heart-beat {
  animation: heartbeat 1.5s ease infinite;
  transform-origin: center;
}

/* Animación de salpicado mejorada */
@keyframes splash {
  0% {
    opacity: 0.8;
    transform: scale(0);
  }
  100% {
    opacity: 0;
    transform: scale(3);
  }
}

.heart-splash {
  position: absolute;
  width: 60px;
  height: 60px;
  pointer-events: none;
  background-image: radial-gradient(
    circle,
    rgba(239, 68, 68, 0.8) 0%,
    rgba(239, 68, 68, 0) 70%
  );
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  animation: splash 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) forwards;
}

/* Animación para cuando se añade a favoritos */
@keyframes heartPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.6); }
  70% { transform: scale(0.8); }
  100% { transform: scale(1); }
}

.heart-button.active .heart-container {
  animation: heartPop 0.5s ease forwards;
}

/* Pequeñas partículas */
.heart-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: rgba(239, 68, 68, 0.8);
  border-radius: 50%;
  pointer-events: none;
}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  // Services
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  isFavorite = signal(false);
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

        // Verificar favoritos al cargar el producto
        setTimeout(() => {
          this.checkIfProductIsFavorite();
        }, 100);
      }
    });
    effect(() => {
      const currentProduct = this.product();
      if (currentProduct) {
        const favorites = this.getFavorites();
        this.isFavorite.set(favorites.some(fav => fav.id === currentProduct.id));
      }
    });

    // Use effect to load related products when we have the product data
    effect(() => {
      const product = this.product();
      if (product?.category?.id) {
        this.loadRelatedProducts(product.category.id);
      }
    });
    this.setupProductChangeEffect();
  }
  private setupProductChangeEffect(): void {
    effect(() => {
      const currentProduct = this.product();
      if (currentProduct?.id) {
        this.checkIfProductIsFavorite();

        // Si hay ID de categoría, cargar productos relacionados
        if (currentProduct.category?.id) {
          this.loadRelatedProducts(currentProduct.category.id);
        }
      }
    });
  }
  private checkIfProductIsFavorite(): void {
    const currentProduct = this.product();
    if (!currentProduct) return;

    const favorites = this.getFavorites();
    const isFav = favorites.some(fav => fav.id === currentProduct.id);
    console.log(`Verificando favorito para producto ${currentProduct.id}: ${isFav}`);
    this.isFavorite.set(isFav);
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

  toggleFavorite(event: MouseEvent): void {
    const currentProduct = this.product();
    if (!currentProduct) return;

    // Cambiar estado
    const newState = !this.isFavorite();
    this.isFavorite.set(newState);

    // Guardar en localStorage
    const favorites = this.getFavorites();

    if (newState) {
      // Añadir a favoritos si no existe
      if (!favorites.some(fav => fav.id === currentProduct.id)) {
        favorites.push({
          id: currentProduct.id,
          name: currentProduct.name,
          price: currentProduct.price,
          imageUrl: this.imageUrls()[0] || '',
          addedAt: new Date().toISOString()
        });
        this.createSplashAnimation(event);
      }
    } else {
      // Remover de favoritos
      const index = favorites.findIndex(fav => fav.id === currentProduct.id);
      if (index !== -1) {
        favorites.splice(index, 1);
      }
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    console.log('Productos favoritos:', favorites);
  }

  private getFavorites(): Array<{ id: number, name: string, price: number, imageUrl: string, addedAt: string }> {
    const storedFavorites = localStorage.getItem('favorites');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  }

// Método para crear animación de salpicado
  private createSplashAnimation(event: MouseEvent): void {
    // Crear elemento para la animación
    const splash = this.renderer.createElement('div');
    this.renderer.addClass(splash, 'heart-splash');

    // Posicionar en el punto del clic
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    this.renderer.setStyle(splash, 'left', `${offsetX}px`);
    this.renderer.setStyle(splash, 'top', `${offsetY}px`);

    // Añadir al DOM
    this.renderer.appendChild(event.target, splash);

    // Remover después de la animación
    setTimeout(() => {
      if (splash.parentNode) {
        this.renderer.removeChild(splash.parentNode, splash);
      }
    }, 700);
  }

}
