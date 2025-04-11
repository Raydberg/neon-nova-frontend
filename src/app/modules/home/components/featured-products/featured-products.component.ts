import { ChangeDetectionStrategy, Component, ElementRef, OnInit, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent, Product } from '../../../../shared/components/product-card/product-card.component';
import { LucideAngularModule, ChevronLeftIcon, ChevronRightIcon } from 'lucide-angular';

@Component({
  selector: 'featured-products',
  imports: [CommonModule, RouterModule, ProductCardComponent, LucideAngularModule],
  styleUrl: "./featured-products.component.css",
  templateUrl: './featured-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedProductsComponent implements OnInit, OnDestroy {
  @ViewChild('productCarousel') productCarousel!: ElementRef;

  // Iconos
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;

  currentSlide = signal(0);

  featuredProducts: Product[] = [
    {
      id: 1,
      nombre: "Laptop Pro X",
      descripcion: "Potente laptop con procesador de última generación",
      precio: 1299.99,
      imagen: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80",
      categoria_id: 1,
      puntuacion: 4.5,
    },
    {
      id: 2,
      nombre: "Smartphone Galaxy Ultra",
      descripcion: "Smartphone con cámara profesional y batería de larga duración",
      precio: 899.99,
      imagen: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1227&q=80",
      categoria_id: 2,
      puntuacion: 4.8,
    },
    {
      id: 3,
      nombre: "Auriculares Noise Cancel",
      descripcion: "Auriculares con cancelación de ruido y sonido premium",
      precio: 249.99,
      imagen: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1165&q=80",
      categoria_id: 3,
      puntuacion: 4.7,
    },
    {
      id: 4,
      nombre: "Smartwatch Fitness Pro",
      descripcion: "Reloj inteligente con monitoreo de salud y GPS integrado",
      precio: 199.99,
      imagen: "https://images.unsplash.com/photo-1617043786395-f977fa12eddf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      categoria_id: 4,
      puntuacion: 4.3,
    },
    {
      id: 5,
      nombre: "Cámara DSLR 4K",
      descripcion: "Cámara profesional con grabación en 4K y lentes intercambiables",
      precio: 1499.99,
      imagen: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1164&q=80",
      categoria_id: 5,
      puntuacion: 4.6,
    },
    {
      id: 6,
      nombre: "Consola GameStation 5",
      descripcion: "La última consola con gráficos 8K y SSD ultrarrápido",
      precio: 499.99,
      imagen: "https://images.unsplash.com/photo-1606318801954-d46d46d3360a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      categoria_id: 7,
      puntuacion: 4.9,
    }
  ];

  private observer: IntersectionObserver | null = null;
  itemsPerSlide = 4;

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
      this.itemsPerSlide = 1; // Mobile
    } else if (width < 1024) {
      this.itemsPerSlide = 2; // Tablet
    } else {
      this.itemsPerSlide = 4; // Desktop
    }
  }

  // Navegación del carousel
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

  getSlideProducts(slideIndex: number): Product[] {
    const start = slideIndex * this.itemsPerSlide;
    const end = Math.min(start + this.itemsPerSlide, this.featuredProducts.length);
    return this.featuredProducts.slice(start, end);
  }

  get totalSlides(): number {
    return Math.ceil(this.featuredProducts.length / this.itemsPerSlide);
  }

  get slideIndicators(): number[] {
    return Array.from({ length: this.totalSlides }, (_, i) => i);
  }
}
