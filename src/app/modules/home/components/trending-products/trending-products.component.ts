import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  signal,
  inject,
  computed,
  effect
} from '@angular/core';
import {RouterModule} from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';
import {ProductCardComponent} from '@shared/components/product-card/product-card.component';
import {ProductService} from '@app/core/services/product.service';
import {rxResource} from '@angular/core/rxjs-interop';
import type {Products} from '@app/core/interfaces/product-client.interface';

interface TrendingProduct extends Products {
  precioAnterior?: number;
  etiqueta?: string;
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
})
export class TrendingProductsComponent implements OnDestroy {
  private productService = inject(ProductService);

  productsResource = rxResource({
    loader: () => this.productService.getProducts(1, 10)
  });

  products = computed(() => {
    const response = this.productsResource.value();
    return response?.items || [];
  });

  enhancedProducts = computed(() => {
    const productsList = this.products();

    if (!Array.isArray(productsList) || productsList.length === 0) {
      return [];
    }

    return productsList.map(product => {
      const trendingProduct: TrendingProduct = {
        ...product,
        etiqueta: Math.random() > 0.7 ? 'Nuevo' : undefined,
        precioAnterior: Math.random() > 0.6 ? product.price * 1.2 : undefined
      };
      return trendingProduct;
    });
  });

  currentSlide = signal(0);
  itemsPerSlide = 4;
  slideIndicators: number[] = [];
  totalSlides = 0;

  @ViewChild('carouselContainer', {static: false}) carouselContainer!: ElementRef;

  isVisible = signal(false);
  private observer: IntersectionObserver | null = null;

  private dataLoadEffect = effect(() => {
    if (!this.productsResource.isLoading() && !this.productsResource.error()) {
      setTimeout(() => {
        this.calculateSlides();
        this.setupIntersectionObserver();
      }, 100);
    }
  });


  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.dataLoadEffect.destroy();
  }

  private calculateSlides() {
    const productsList = this.enhancedProducts();
    if (!productsList || productsList.length === 0) return;

    this.totalSlides = Math.ceil(productsList.length / this.itemsPerSlide);
    this.slideIndicators = Array.from({length: this.totalSlides}, (_, i) => i);
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
