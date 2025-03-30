import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ElementRef, ViewChild, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrar plugins
gsap.registerPlugin(ScrollTrigger);

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'promo-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './promo-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoBannerComponent implements OnInit, OnDestroy {
  @ViewChild('promoBanner', { static: false }) promoBanner!: ElementRef;
  @ViewChild('promoImage', { static: false }) promoImage!: ElementRef;

  // Fecha de finalización de la oferta (2 días a partir de ahora)
  private endDate = new Date();
  private interval: any;

  // Señales para estado reactivo
  timeLeft = signal<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Efecto para el gradiente de fondo
  bannerGradient = signal('bg-gradient-to-r from-purple-600 to-indigo-700');

  // Porcentaje de descuento
  discountPercent = signal(30);

  // Imagen promocional
  promoImageSrc = signal('https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1057&q=80');

  constructor() {
    // Configurar la fecha de finalización
    this.endDate.setDate(this.endDate.getDate() + 2);
    this.endDate.setHours(this.endDate.getHours() + 15);
  }

  ngOnInit() {
    // Iniciar el contador
    this.startCountdown();

    // Configurar animaciones después de que el componente esté inicializado
    setTimeout(() => {
      this.setupAnimations();
    }, 100);
  }

  ngOnDestroy() {
    // Limpiar el intervalo cuando el componente se destruye
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private startCountdown() {
    // Función para calcular el tiempo restante
    const calculateTimeLeft = () => {
      const difference = +this.endDate - +new Date();

      if (difference > 0) {
        this.timeLeft.set({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // Si el tiempo ha terminado, limpiamos el intervalo
        if (this.interval) {
          clearInterval(this.interval);
        }
      }
    };

    // Calcular el tiempo inicial
    calculateTimeLeft();

    // Actualizar cada segundo
    this.interval = setInterval(calculateTimeLeft, 1000);
  }

  private setupAnimations() {
    if (!this.promoBanner || !this.promoImage) return;

    // Animación de entrada del banner
    ScrollTrigger.create({
      trigger: this.promoBanner.nativeElement,
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo(this.promoBanner.nativeElement,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'power3.out'
          }
        );
      },
      once: true
    });

    // Animación continua para la imagen promocional
    gsap.to(this.promoImage.nativeElement, {
      y: -10,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });

    // Animación de rotación suave
    gsap.to(this.promoImage.nativeElement, {
      rotation: 5,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      delay: 0.5
    });
  }

  // Métodos de ayuda para formatear el tiempo
  padNumber(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }
}
