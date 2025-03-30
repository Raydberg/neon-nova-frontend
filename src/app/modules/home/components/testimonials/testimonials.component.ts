import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ElementRef, ViewChild, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { LucideAngularModule, StarIcon, ChevronLeftIcon, ChevronRightIcon, QuoteIcon } from 'lucide-angular';

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  role: string;
  content: string;
  rating: number;
}

@Component({
  selector: 'home-testimonials',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './testimonials.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  @ViewChild('testimonialCard', { static: false }) testimonialCard!: ElementRef;

  // Icons
  readonly StarIcon = StarIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly QuoteIcon = QuoteIcon;

  // Reactive state with signals
  activeIndex = signal(0);
  isAnimating = signal(false);

  // Estado para autoplay
  autoplayEnabled = signal(true);
  private autoplayInterval: any;
  private readonly AUTOPLAY_DELAY = 5000; // 5 segundos

  // Testimonios de ejemplo
  testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Juan Pérez",
      avatar: "/assets/images/avatars/avatar-1.png",
      role: "Desarrollador Web",
      content:
        "Compré la Laptop Pro X y ha superado todas mis expectativas. El rendimiento es excepcional y la batería dura todo el día. Definitivamente la mejor inversión que he hecho para mi trabajo.",
      rating: 5,
    },
    {
      id: 2,
      name: "María García",
      avatar: "/assets/images/avatars/avatar-2.png",
      role: "Fotógrafa",
      content:
        "La Cámara DSLR 4K tiene una calidad de imagen impresionante. La he usado en varias sesiones profesionales y los resultados son espectaculares. El servicio de entrega fue rápido y eficiente.",
      rating: 5,
    },
    {
      id: 3,
      name: "Carlos Rodríguez",
      avatar: "/assets/images/avatars/avatar-3.png",
      role: "Estudiante",
      content:
        "Los Auriculares Noise Cancel son perfectos para estudiar. La cancelación de ruido es excelente y la calidad de sonido es increíble. Además, son muy cómodos para usar durante horas.",
      rating: 4,
    },
    {
      id: 4,
      name: "Ana Martínez",
      avatar: "/assets/images/avatars/avatar-4.png",
      role: "Ingeniera de Software",
      content:
        "El Smartphone Galaxy Ultra es simplemente increíble. La cámara es de otro nivel y la duración de la batería me permite usarlo todo el día sin preocupaciones. La pantalla es nítida y los colores son vibrantes.",
      rating: 5,
    },
    {
      id: 5,
      name: "Roberto Gómez",
      avatar: "/assets/images/avatars/avatar-5.png",
      role: "Diseñador Gráfico",
      content:
        "La Tablet Pro 12 es perfecta para mi trabajo de diseño. La pantalla es grande y precisa, y el lápiz incluido funciona de maravilla. La potencia del procesador me permite trabajar con aplicaciones exigentes sin problemas.",
      rating: 4,
    },
  ];

  // Métodos para navegación
  nextTestimonial() {
    if (this.isAnimating()) return;

    this.isAnimating.set(true);
    const nextIndex = this.activeIndex() === this.testimonials.length - 1 ? 0 : this.activeIndex() + 1;
    this.animateTransition('next', nextIndex);
  }

  prevTestimonial() {
    if (this.isAnimating()) return;

    this.isAnimating.set(true);
    const prevIndex = this.activeIndex() === 0 ? this.testimonials.length - 1 : this.activeIndex() - 1;
    this.animateTransition('prev', prevIndex);
  }

  goToTestimonial(index: number) {
    if (this.isAnimating() || index === this.activeIndex()) return;

    this.isAnimating.set(true);
    const direction = index > this.activeIndex() ? 'next' : 'prev';
    this.animateTransition(direction, index);
  }

  // Método para generar array para el rating
  generateStars(count: number): number[] {
    return Array(5).fill(0).map((_, i) => i < count ? 1 : 0);
  }

  // Inicializar
  ngOnInit() {
    this.startAutoplay();
  }

  // Limpiar al destruir
  ngOnDestroy() {
    this.stopAutoplay();
  }

  // Animación con GSAP
  private animateTransition(direction: 'next' | 'prev', newIndex: number) {
    if (!this.testimonialCard) {
      this.activeIndex.set(newIndex);
      this.isAnimating.set(false);
      return;
    }

    const element = this.testimonialCard.nativeElement;
    const xOffset = direction === 'next' ? 100 : -100;

    // Detener autoplay durante la interacción
    this.pauseAutoplay();

    // Animación de salida
    gsap.to(element, {
      opacity: 0,
      x: -xOffset,
      duration: 0.3,
      ease: "power1.inOut",
      onComplete: () => {
        // Actualizar índice activo
        this.activeIndex.set(newIndex);

        // Restablecer posición para entrada
        gsap.set(element, { x: xOffset });

        // Animación de entrada
        gsap.to(element, {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: "power1.out",
          onComplete: () => {
            this.isAnimating.set(false);
          }
        });
      }
    });
  }

  // Autoplay
  startAutoplay() {
    this.stopAutoplay();

    if (this.autoplayEnabled()) {
      this.autoplayInterval = setInterval(() => {
        if (this.autoplayEnabled() && !this.isAnimating()) {
          this.nextTestimonial();
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
    this.autoplayEnabled.set(false);
    setTimeout(() => {
      this.autoplayEnabled.set(true);
      this.startAutoplay();
    }, 10000); // Reanudar después de 10 segundos de inactividad
  }

  // Obtener iniciales para avatar fallback
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
