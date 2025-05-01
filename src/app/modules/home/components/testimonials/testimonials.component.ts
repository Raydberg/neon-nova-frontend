import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

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
  styleUrl: "./testimonials.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  @ViewChild('testimonialCard', { static: false }) testimonialCard!: ElementRef;

  activeIndex = signal(0);
  animating = signal(false);
  direction = signal<'next' | 'prev'>('next');

  autoplayEnabled = signal(true);
  private autoplayInterval: any;
  private readonly AUTOPLAY_DELAY = 5000; // 5 segundos

  testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Juan Pérez",
      avatar: "",
      role: "Desarrollador Web",
      content:
        "Compré la Laptop Pro X y ha superado todas mis expectativas. El rendimiento es excepcional y la batería dura todo el día. Definitivamente la mejor inversión que he hecho para mi trabajo.",
      rating: 5,
    },
    {
      id: 2,
      name: "María García",
      avatar: "",
      role: "Fotógrafa",
      content:
        "La Cámara DSLR 4K tiene una calidad de imagen impresionante. La he usado en varias sesiones profesionales y los resultados son espectaculares. El servicio de entrega fue rápido y eficiente.",
      rating: 5,
    },
    {
      id: 3,
      name: "Carlos Rodríguez",
      avatar: "",
      role: "Estudiante",
      content:
        "Los Auriculares Noise Cancel son perfectos para estudiar. La cancelación de ruido es excelente y la calidad de sonido es increíble. Además, son muy cómodos para usar durante horas.",
      rating: 4,
    },
    {
      id: 4,
      name: "Ana Martínez",
      avatar: "",
      role: "Ingeniera de Software",
      content:
        "El Smartphone Galaxy Ultra es simplemente increíble. La cámara es de otro nivel y la duración de la batería me permite usarlo todo el día sin preocupaciones. La pantalla es nítida y los colores son vibrantes.",
      rating: 5,
    },
    {
      id: 5,
      name: "Roberto Gómez",
      avatar: "",
      role: "Diseñador Gráfico",
      content:
        "La Tablet Pro 12 es perfecta para mi trabajo de diseño. La pantalla es grande y precisa, y el lápiz incluido funciona de maravilla. La potencia del procesador me permite trabajar con aplicaciones exigentes sin problemas.",
      rating: 4,
    },
  ];

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  isAnimating(): boolean {
    return this.animating();
  }

  nextTestimonial() {
    if (this.animating()) return;

    this.direction.set('next');
    this.animating.set(true);
    const nextIndex = this.activeIndex() === this.testimonials.length - 1 ? 0 : this.activeIndex() + 1;

    this.pauseAutoplay();

    setTimeout(() => {
      this.activeIndex.set(nextIndex);

      setTimeout(() => {
        this.animating.set(false);
      }, 300);
    }, 300);
  }

  prevTestimonial() {
    if (this.animating()) return;

    this.direction.set('prev');
    this.animating.set(true);
    const prevIndex = this.activeIndex() === 0 ? this.testimonials.length - 1 : this.activeIndex() - 1;

    this.pauseAutoplay();

    setTimeout(() => {
      this.activeIndex.set(prevIndex);

      setTimeout(() => {
        this.animating.set(false);
      }, 300);
    }, 300);
  }

  goToTestimonial(index: number) {
    if (this.animating() || index === this.activeIndex()) return;

    const dir = index > this.activeIndex() ? 'next' : 'prev';
    this.direction.set(dir);
    this.animating.set(true);

    this.pauseAutoplay();

    setTimeout(() => {
      this.activeIndex.set(index);

      setTimeout(() => {
        this.animating.set(false);
      }, 300);
    }, 300);
  }

  generateStars(count: number): number[] {
    return Array(5).fill(0).map((_, i) => i < count ? 1 : 0);
  }

  startAutoplay() {
    this.stopAutoplay();

    if (this.autoplayEnabled()) {
      this.autoplayInterval = setInterval(() => {
        if (this.autoplayEnabled() && !this.animating()) {
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
    }, 10000);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
