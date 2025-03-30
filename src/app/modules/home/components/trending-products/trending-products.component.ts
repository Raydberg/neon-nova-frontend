import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, OnDestroy, ViewChild, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ChevronLeftIcon, ChevronRightIcon, ShoppingCartIcon, StarIcon, TrendingUpIcon } from 'lucide-angular';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProductCardComponent, Product } from '../../../../shared/components/product-card/product-card.component';

gsap.registerPlugin(ScrollTrigger);

interface TrendingProduct extends Product {
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
export class TrendingProductsComponent implements OnInit, OnDestroy {
  @ViewChild('carouselContainer', { static: false }) carouselContainer!: ElementRef;

  // Icons
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly ShoppingCartIcon = ShoppingCartIcon;
  readonly StarIcon = StarIcon;
  readonly TrendingUpIcon = TrendingUpIcon;

  scrollPosition = signal(0);
  canScrollLeft = signal(false);
  canScrollRight = signal(true);
  isAutoplayActive = signal(true);

  private autoplayInterval: any;
  private readonly AUTOPLAY_DELAY = 1000;
  private readonly AUTOPLAY_PAUSE_AFTER_INTERACTION = 1000;

  trendingProducts: TrendingProduct[] = [
    {
      id: 1,
      nombre: "Laptop Pro X",
      descripcion: "Potente laptop con procesador de última generación",
      precio: 1299.99,
      precioAnterior: 1499.99,
      imagen: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80",
      categoria_id: 1,
      puntuacion: 4.5,
      etiqueta: "Más vendido",
    },
    {
      id: 2,
      nombre: "Smartphone Galaxy Ultra",
      descripcion: "Smartphone con cámara profesional y batería de larga duración",
      precio: 899.99,
      precioAnterior: 999.99,
      imagen: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1227&q=80",
      categoria_id: 2,
      puntuacion: 4.8,
      etiqueta: "Tendencia",
    },
    {
      id: 3,
      nombre: "Auriculares Noise Cancel",
      descripcion: "Auriculares con cancelación de ruido y sonido premium",
      precio: 249.99,
      precioAnterior: 299.99,
      imagen: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1165&q=80",
      categoria_id: 3,
      puntuacion: 4.7,
      etiqueta: "Oferta",
    },
    {
      id: 4,
      nombre: "Smartwatch Fitness Pro",
      descripcion: "Reloj inteligente con monitoreo de salud y GPS integrado",
      precio: 199.99,
      precioAnterior: 249.99,
      imagen: "https://images.unsplash.com/photo-1617043786395-f977fa12eddf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      categoria_id: 4,
      puntuacion: 4.3,
      etiqueta: "Nuevo",
    },
    {
      id: 5,
      nombre: "Cámara DSLR 4K",
      descripcion: "Cámara profesional con grabación en 4K y lentes intercambiables",
      precio: 1499.99,
      precioAnterior: 1799.99,
      imagen: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1164&q=80",
      categoria_id: 5,
      puntuacion: 4.6,
      etiqueta: "Premium",
    },
    {
      id: 6,
      nombre: "Cámara DSLR 4K",
      descripcion: "Cámara profesional con grabación en 4K y lentes intercambiables",
      precio: 1499.99,
      precioAnterior: 1799.99,
      imagen: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1164&q=80",
      categoria_id: 5,
      puntuacion: 4.6,
      etiqueta: "Premium",
    },
    {
      id: 7,
      nombre: "Cámara DSLR 4K",
      descripcion: "Cámara profesional con grabación en 4K y lentes intercambiables",
      precio: 1499.99,
      precioAnterior: 1799.99,
      imagen: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1164&q=80",
      categoria_id: 5,
      puntuacion: 4.6,
      etiqueta: "Premium",
    },
    {
      id: 8,
      nombre: "Cámara DSLR 4K",
      descripcion: "Cámara profesional con grabación en 4K y lentes intercambiables",
      precio: 1499.99,
      precioAnterior: 1799.99,
      imagen: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1164&q=80",
      categoria_id: 5,
      puntuacion: 4.6,
      etiqueta: "Premium",
    },
    {
      id: 9,
      nombre: "Consola GameStation 5",
      descripcion: "La última consola con gráficos 8K y SSD ultrarrápido",
      precio: 499.99,
      precioAnterior: 549.99,
      imagen: "https://images.unsplash.com/photo-1606318801954-d46d46d3360a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      categoria_id: 7,
      puntuacion: 4.9,
      etiqueta: "Alto rendimiento",
    }
  ];

  ngOnInit() {
    setTimeout(() => {
      this.setupAnimations();
      this.startAutoplay();
    }, 100);
  }

  ngOnDestroy() {
    this.stopAutoplay();
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

  // Detener autoplay
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  pauseAutoplay() {
    this.isAutoplayActive.set(false);

    // Reiniciar autoplay después de un tiempo
    setTimeout(() => {
      this.isAutoplayActive.set(true);
      this.startAutoplay();
    }, this.AUTOPLAY_PAUSE_AFTER_INTERACTION);
  }

  // Scroll al inicio del carrusel
  scrollToStart() {
    if (!this.carouselContainer) return;

    const container = this.carouselContainer.nativeElement;

    gsap.to(container, {
      scrollLeft: 0,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        // Actualizar la posición y estados durante la animación
        this.scrollPosition.set(container.scrollLeft);
        this.updateScrollButtonStates();
      }
    });
  }

  // Método mejorado para scroll manual
  scroll(direction: 'left' | 'right') {
    if (!this.carouselContainer) return;

    const container = this.carouselContainer.nativeElement;
    const scrollAmount = container.clientWidth * 0.75; // Scroll 75% de la vista visible
    const maxScroll = container.scrollWidth - container.clientWidth;

    let newPosition: number;

    if (direction === 'left') {
      newPosition = Math.max(this.scrollPosition() - scrollAmount, 0);
    } else {
      newPosition = Math.min(this.scrollPosition() + scrollAmount, maxScroll);
    }

    this.pauseAutoplay();

    gsap.to(container, {
      scrollLeft: newPosition,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        this.scrollPosition.set(container.scrollLeft);
        this.updateScrollButtonStates();
      }
    });
  }

  private updateScrollButtonStates() {
    if (!this.carouselContainer) return;

    const container = this.carouselContainer.nativeElement;
    const currentPosition = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    // Tolerancia para considerar que estamos al inicio/final (1px)
    const isAtStart = currentPosition <= 1;
    const isAtEnd = Math.abs(maxScroll - currentPosition) <= 1;

    this.canScrollLeft.set(!isAtStart);
    this.canScrollRight.set(!isAtEnd);
  }

  onScroll(event: Event) {
    if (!this.carouselContainer) return;

    const container = this.carouselContainer.nativeElement;
    this.scrollPosition.set(container.scrollLeft);
    this.updateScrollButtonStates();

    this.pauseAutoplay();
  }

  calcularDescuento(precioActual: number, precioAnterior: number): number {
    if (!precioAnterior || precioAnterior <= precioActual) return 0;
    const descuento = ((precioAnterior - precioActual) / precioAnterior) * 100;
    return Math.round(descuento);
  }

  private setupAnimations() {
    if (!this.carouselContainer) return;

    const productCards = this.carouselContainer.nativeElement.querySelectorAll('.product-card');

    gsap.fromTo(productCards,
      {
        y: 20,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: this.carouselContainer.nativeElement,
          start: "top 80%"
        }
      }
    );
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  generateStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  shouldFillStar(starIndex: number, rating: number): boolean {
    return starIndex < rating;
  }
}
