import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, OnDestroy, ViewChild, signal, inject, computed, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { ProductService } from '@app/core/services/product.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Products, ProductResponseClient } from '@app/core/interfaces/product-client.interface';

// Define interface that extends the Products interface to add additional properties
interface TrendingProduct extends Products {
  precioAnterior?: number; // Optional previous price for showing discounts
  etiqueta?: string; // Optional label like "New", "Sale", etc.
}

@Component({
  selector: 'trending-products',
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ProductCardComponent
  ],
  templateUrl: './trending-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TrendingProductsComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);

  // Use Angular's rxResource to handle API calls reactively
  productsResource = rxResource({
    loader: () => this.productService.getProducts(1, 10)
  });

  // Make a computed property for the items array
  products = computed(() => {
    // Ensure we have an items array to work with
    const response = this.productsResource.value();
    return response?.items || [];
  });

  // Transform regular products into trending products with additional data
  enhancedProducts = computed(() => {
    const productsList = this.products();

    // Ensure we have an array before trying to map
    if (!Array.isArray(productsList) || productsList.length === 0) {
      return [];
    }

    return productsList.map(product => {
      const trendingProduct: TrendingProduct = {
        ...product,
        // Añadir etiqueta "Nuevo" aleatoriamente a algunos productos (solo para demo)
        etiqueta: Math.random() > 0.7 ? 'Nuevo' : undefined,
        // Añadir precio anterior aleatoriamente a algunos productos (solo para demo)
        precioAnterior: Math.random() > 0.6 ? product.price * 1.2 : undefined
      };
      return trendingProduct;
    });
  });

  // Pagination related properties
  currentSlide = signal(0);
  itemsPerSlide = 4; // Adjust based on your design
  slideIndicators: number[] = [];
  totalSlides = 0;

  @ViewChild('carouselContainer', { static: false }) carouselContainer!: ElementRef;

  // Estados reactivos con signals
  isVisible = signal(false);
  private observer: IntersectionObserver | null = null;

  ngOnInit() {
    // Use effect to react to state changes
    effect(() => {
      // Only proceed when loading is complete and we have data
      if (!this.productsResource.isLoading() && !this.productsResource.error()) {
        setTimeout(() => {
          this.calculateSlides();
          this.setupIntersectionObserver();
        }, 100);
      }
    });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private calculateSlides() {
    const productsList = this.enhancedProducts();
    if (!productsList || productsList.length === 0) return;

    this.totalSlides = Math.ceil(productsList.length / this.itemsPerSlide);
    this.slideIndicators = Array.from({ length: this.totalSlides }, (_, i) => i);
  }

  getSlideProducts(slideIndex: number): TrendingProduct[] {
    const productsList = this.enhancedProducts();
    if (!productsList || productsList.length === 0) return [];

    const start = slideIndex * this.itemsPerSlide;
    const end = start + this.itemsPerSlide;
    return productsList.slice(start, end);
  }

  nextSlide() {
    if (this.currentSlide() < this.totalSlides - 1) {
      this.currentSlide.update(val => val + 1);
    }
  }

  prevSlide() {
    if (this.currentSlide() > 0) {
      this.currentSlide.update(val => val - 1);
    }
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
  }

  private setupIntersectionObserver() {
    if (!this.carouselContainer?.nativeElement) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.isVisible.set(true);
          this.observer?.disconnect();
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px'
    });

    this.observer.observe(this.carouselContainer.nativeElement);
  }

  calcularDescuento(precioActual: number, precioAnterior: number): number {
    if (!precioAnterior || precioAnterior <= precioActual) return 0;
    const descuento = ((precioAnterior - precioActual) / precioAnterior) * 100;
    return Math.round(descuento);
  }
  
}
