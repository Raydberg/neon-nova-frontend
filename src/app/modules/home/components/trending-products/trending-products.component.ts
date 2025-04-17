import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, OnDestroy, ViewChild, signal, inject, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { ProductService } from '@app/core/services/product.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductResponseClient } from '@app/core/interfaces/product-client.interface';

interface TrendingProduct extends ProductResponseClient {
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
  standalone: true,
})
export class TrendingProductsComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);

  products = rxResource({
    loader: () => this.productService.getProducts()
  });

  enhancedProducts = computed(() => {
    if (!this.products.value()) return [];

    return this.products.value()!.map(product => {
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

  @ViewChild('carouselContainer', { static: false }) carouselContainer!: ElementRef;

  // Estados reactivos con signals
  scrollPosition = signal(0);
  canScrollLeft = signal(false);
  canScrollRight = signal(true);
  isAutoplayActive = signal(true);
  isVisible = signal(false);

  // Configuración de autoplay
  private autoplayInterval: any;
  private readonly AUTOPLAY_DELAY = 5000;
  private readonly AUTOPLAY_PAUSE_AFTER_INTERACTION = 10000;
  private observer: IntersectionObserver | null = null;

  ngOnInit() {
    setTimeout(() => {
      this.setupIntersectionObserver();
      this.startAutoplay();
    }, 100);
  }

  ngOnDestroy() {
    this.stopAutoplay();
    if (this.observer) {
      this.observer.disconnect();
    }
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

  startAutoplay() {
    this.stopAutoplay();

    if (this.isAutoplayActive()) {
      this.autoplayInterval = setInterval(() => {
        if (this.isAutoplayActive()) {
          if (!this.canScrollRight()) {
            this.scrollToStart();
          } else {
            this.scroll('right');
          }
        }
      }, this.AUTOPLAY_DELAY);
    }
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  pauseAutoplay() {
    this.isAutoplayActive.set(false);

    setTimeout(() => {
      this.isAutoplayActive.set(true);
      this.startAutoplay();
    }, this.AUTOPLAY_PAUSE_AFTER_INTERACTION);
  }

  scrollToStart() {
    if (!this.carouselContainer) return;

    const container = this.carouselContainer.nativeElement;
    container.scrollTo({
      left: 0,
      behavior: 'smooth'
    });

    this.updateScrollStates(0);
  }

  scroll(direction: 'left' | 'right') {
    if (!this.carouselContainer) return;

    const container = this.carouselContainer.nativeElement;
    const scrollAmount = container.clientWidth * 0.75;
    const maxScroll = container.scrollWidth - container.clientWidth;

    let newPosition: number;

    if (direction === 'left') {
      newPosition = Math.max(this.scrollPosition() - scrollAmount, 0);
    } else {
      newPosition = Math.min(this.scrollPosition() + scrollAmount, maxScroll);
    }

    this.pauseAutoplay();

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });

    this.updateScrollStates(newPosition);
  }

  updateScrollStates(position: number) {
    if (!this.carouselContainer) return;

    const container = this.carouselContainer.nativeElement;
    const maxScroll = container.scrollWidth - container.clientWidth;

    this.canScrollLeft.set(position > 1);
    this.canScrollRight.set(position < maxScroll - 1);

    this.scrollPosition.set(position);
  }

  onScroll(event: Event) {
    if (!this.carouselContainer) return;

    const container = this.carouselContainer.nativeElement;
    const currentPosition = container.scrollLeft;

    this.updateScrollStates(currentPosition);
    this.pauseAutoplay();
  }

  calcularDescuento(precioActual: number, precioAnterior: number): number {
    if (!precioAnterior || precioAnterior <= precioActual) return 0;
    const descuento = ((precioAnterior - precioActual) / precioAnterior) * 100;
    return Math.round(descuento);
  }
}
