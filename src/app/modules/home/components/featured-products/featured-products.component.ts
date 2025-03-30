import { ChangeDetectionStrategy, Component, ElementRef, OnInit, OnDestroy, ViewChild, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProductCardComponent, Product } from '../../../../shared/components/product-card/product-card.component';
import { LucideAngularModule, ChevronLeftIcon, ChevronRightIcon } from 'lucide-angular';
import { interval, Subscription } from 'rxjs';

// Registrar el plugin de ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'featured-products',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, LucideAngularModule],
  templateUrl: './featured-products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedProductsComponent implements OnInit, OnDestroy {

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
  @ViewChild('productCarousel', { static: false }) productCarousel!: ElementRef;
  @ViewChild('productContainer', { static: false }) productContainer!: ElementRef;

  // Para forzar la detección de cambios cuando sea necesario
  private cd = inject(ChangeDetectorRef);

  // Iconos
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;

  // Señales para el estado
  currentSlide = signal(0);
  autoplayActive = signal(true);
  animating = signal(false); // Nueva señal para bloquear clicks durante animaciones

  private autoplaySubscription?: Subscription;
  private clickTimeout: any; // Para prevenir doble clicks

  // Método para exponer la señal animating al template
  isAnimating(): boolean {
    return this.animating();
  }

  // Los productos destacados ya existen en tu código actual, no incluidos aquí

  itemsPerSlide = 4; // Número de productos por slide en escritorio

  ngOnInit() {
    // Ajustar itemsPerSlide basado en el ancho de la ventana
    this.adjustItemsPerSlide();

    // Configurar animaciones al cargar
    setTimeout(() => {
      this.setupCarouselAnimation();
      this.startAutoplay();
    }, 100);

    // Escuchar cambios de tamaño de ventana con un manejador único
    const resizeHandler = () => {
      this.adjustItemsPerSlide();
      this.cd.detectChanges();
    };

    window.addEventListener('resize', resizeHandler);

    // Almacenar la referencia para eliminarla correctamente
    (this as any).resizeHandler = resizeHandler;
  }

  ngOnDestroy() {
    this.stopAutoplay();

    // Remover event listener usando la referencia almacenada
    window.removeEventListener('resize', (this as any).resizeHandler);

    // Limpiar timeout si existe
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
  }

  // Manejadores para evitar múltiples clicks rápidos
  handlePrevClick() {
    if (this.isAnimating() || this.currentSlide() === 0) return;

    this.prevSlide();
  }

  handleNextClick() {
    if (this.isAnimating() || this.currentSlide() === this.totalSlides - 1) return;

    this.nextSlide();
  }

  handleIndicatorClick(index: number) {
    if (this.isAnimating() || index === this.currentSlide()) return;

    this.goToSlide(index);
  }

  // Iniciar autoplay
  startAutoplay() {
    this.autoplayActive.set(true);
    this.autoplaySubscription = interval(5000).subscribe(() => {
      if (this.autoplayActive() && !this.animating()) {
        const isLastSlide = this.currentSlide() === this.totalSlides - 1;

        if (isLastSlide) {
          this.goToSlide(0); // Volver al primer slide
        } else {
          this.nextSlide(); // Avanzar al siguiente slide
        }
      }
    });
  }

  // Detener autoplay
  stopAutoplay() {
    this.autoplayActive.set(false);
    if (this.autoplaySubscription) {
      this.autoplaySubscription.unsubscribe();
      this.autoplaySubscription = undefined;
    }
  }

  // Pausar autoplay temporalmente (para interacciones manuales)
  pauseAutoplay() {
    this.autoplayActive.set(false);
    // Reiniciamos después de 10 segundos de inactividad
    setTimeout(() => {
      this.autoplayActive.set(true);
    }, 10000);
  }

  // Ajustar cuántos elementos mostrar según el ancho de la ventana
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

  private setupCarouselAnimation() {
    if (!this.productCarousel) return;

    ScrollTrigger.create({
      trigger: this.productCarousel.nativeElement,
      start: "top 80%",
      onEnter: () => {
        gsap.fromTo('.product-item',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out"
          }
        );
      },
      once: true
    });
  }

  prevSlide() {
    const newSlide = this.currentSlide() - 1;
    if (newSlide >= 0 && !this.animating()) {
      this.animating.set(true);
      this.currentSlide.set(newSlide);
      this.animateSlide('right');
      this.pauseAutoplay();
    }
  }

  nextSlide() {
    const newSlide = this.currentSlide() + 1;
    const maxSlide = Math.ceil(this.featuredProducts.length / this.itemsPerSlide) - 1;

    if (newSlide <= maxSlide && !this.animating()) {
      this.animating.set(true);
      this.currentSlide.set(newSlide);
      this.animateSlide('left');
      this.pauseAutoplay();
    }
  }

  // Verificar si un producto debe mostrarse en el slide actual
  isProductVisible(product: Product): boolean {
    const start = this.currentSlide() * this.itemsPerSlide;
    const end = start + this.itemsPerSlide;
    const index = this.featuredProducts.findIndex(p => p.id === product.id);
    return index >= start && index < end;
  }

  goToSlide(index: number) {
    if (index === this.currentSlide() || this.animating()) return;

    const direction = index > this.currentSlide() ? 'left' : 'right';
    this.animating.set(true);
    this.currentSlide.set(index);
    this.animateSlide(direction);
    this.pauseAutoplay();
  }

  private animateSlide(direction: 'left' | 'right') {
    if (!this.productContainer) {
      this.animating.set(false);
      return;
    }

    // Obtener elementos actuales
    const productItems = document.querySelectorAll('.product-item');

    // Crear una secuencia de animación más suave
    const tl = gsap.timeline({
      onComplete: () => {
        this.animating.set(false);
        this.cd.detectChanges();
      }
    });

    // Primero, animar la salida de los elementos actuales
    tl.to(productItems, {
      opacity: 0,
      x: direction === 'left' ? -20 : 20,
      scale: 0.95,
      duration: 0.5,
      ease: "power2.inOut",
      stagger: {
        each: 0.05,
        from: direction === 'left' ? "start" : "end"
      }
    });

    // Luego preparar los nuevos elementos
    tl.set(productItems, {
      x: direction === 'left' ? 30 : -30,
      scale: 0.9
    });

    // Finalmente, animar la entrada de los nuevos elementos
    tl.to(productItems, {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.2)",
      stagger: {
        each: 0.07,
        from: direction === 'left' ? "start" : "end"
      }
    });

    // Añadir un efecto de resaltado para elementos recién mostrados
    gsap.fromTo(productItems,
      { boxShadow: "0 0 0 rgba(0,0,0,0)" },
      {
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        duration: 0.7,
        delay: 0.3,
        stagger: 0.05,
        ease: "power1.inOut"
      }
    );
  }

  // Total de slides
  get totalSlides(): number {
    return Math.ceil(this.featuredProducts.length / this.itemsPerSlide);
  }

  // Array para iterar en los indicadores
  get slideIndicators(): number[] {
    return Array.from({ length: this.totalSlides }, (_, i) => i);
  }
}
