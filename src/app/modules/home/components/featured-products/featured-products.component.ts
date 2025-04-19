import { ChangeDetectionStrategy, Component, ElementRef, OnInit, OnDestroy, ViewChild, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { LucideAngularModule } from 'lucide-angular';
import { ProductService } from '@app/core/services/product.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductResponseClient, Products } from '@app/core/interfaces/product-client.interface';

@Component({
  selector: 'featured-products',
  imports: [CommonModule, RouterModule, ProductCardComponent, LucideAngularModule],
  styleUrl: "./featured-products.component.css",
  templateUrl: './featured-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedProductsComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);

  productsResource = rxResource({
    loader: () => this.productService.getProducts()
  });

  featuredProducts = computed(() => {
    const response = this.productsResource.value();
    if (!response) return [];

    // Acceder al array de productos dentro de la respuesta
    return [...response.items]
      .sort((a, b) => b.punctuation - a.punctuation)
      .slice(0, 8);
  });

  @ViewChild('productCarousel') productCarousel!: ElementRef;

  currentSlide = signal(0);
  itemsPerSlide = 4;
  private observer: IntersectionObserver | null = null;

  ngOnInit() {
    this.adjustItemsPerSlide();
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  handleResize() {
    this.adjustItemsPerSlide();
  }

  private adjustItemsPerSlide() {
    const width = window.innerWidth;

    if (width < 640) {
      this.itemsPerSlide = 1;
    } else if (width < 1024) {
      this.itemsPerSlide = 2;
    } else {
      this.itemsPerSlide = 4;
    }
  }

  prevSlide() {
    if (this.currentSlide() > 0) {
      this.currentSlide.set(this.currentSlide() - 1);
    }
  }

  nextSlide() {
    if (this.currentSlide() < this.totalSlides - 1) {
      this.currentSlide.set(this.currentSlide() + 1);
    }
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
  }

  getSlideProducts(slideIndex: number): Products[] {
    const products = this.featuredProducts();
    const start = slideIndex * this.itemsPerSlide;
    const end = Math.min(start + this.itemsPerSlide, products.length);
    return products.slice(start, end);
  }

  get totalSlides(): number {
    return Math.ceil(this.featuredProducts().length / this.itemsPerSlide);
  }

  get slideIndicators(): number[] {
    return Array.from({ length: this.totalSlides }, (_, i) => i);
  }
}
