import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShieldCheckIcon, TruckIcon, CreditCardIcon, LifeBuoyIcon } from 'lucide-angular';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrar ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
}

@Component({
  selector: 'why-choose-us',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './why-choose-us.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhyChooseUsComponent implements OnInit {
  @ViewChild('featuresContainer', { static: false }) featuresContainer!: ElementRef;

  isVisible = signal(false);

  // Referencia a los iconos
  readonly ShieldCheckIcon = ShieldCheckIcon;
  readonly TruckIcon = TruckIcon;
  readonly CreditCardIcon = CreditCardIcon;
  readonly LifeBuoyIcon = LifeBuoyIcon;

  features: Feature[] = [
    {
      id: 1,
      title: "Productos garantizados",
      description: "Todos nuestros productos cuentan con garantía oficial del fabricante",
      icon: ShieldCheckIcon,
      color: "text-blue-600 bg-blue-100",
    },
    {
      id: 2,
      title: "Envío rápido",
      description: "Entrega en 24-48 horas a todo el país",
      icon: TruckIcon,
      color: "text-green-600 bg-green-100",
    },
    {
      id: 3,
      title: "Pago seguro",
      description: "Múltiples métodos de pago con la máxima seguridad",
      icon: CreditCardIcon,
      color: "text-purple-600 bg-purple-100",
    },
    {
      id: 4,
      title: "Soporte 24/7",
      description: "Atención al cliente disponible todos los días",
      icon: LifeBuoyIcon,
      color: "text-red-600 bg-red-100",
    },
  ];

  ngOnInit() {
    // Configuración de la animación después de que los componentes estén renderizados
    setTimeout(() => {
      this.setupAnimation();
    }, 100);
  }

  private setupAnimation() {
    // Crear un ScrollTrigger que active la animación cuando la sección sea visible
    ScrollTrigger.create({
      trigger: this.featuresContainer?.nativeElement,
      start: "top 80%",
      onEnter: () => {
        this.isVisible.set(true);
        this.animateFeatures();
      },
      once: true
    });
  }

  private animateFeatures() {
    if (!this.featuresContainer || !this.isVisible()) return;

    // Seleccionar los elementos a animar
    const featureCards = this.featuresContainer.nativeElement.querySelectorAll('.feature-card');

    // Crear una animación de entrada con GSAP
    gsap.fromTo(featureCards,
      {
        y: 30,
        opacity: 0,
        scale: 0.95
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.1,  // Efecto escalonado
        duration: 0.7,
        ease: "power2.out",
        clearProps: "all" // Limpiar propiedades después para evitar problemas de rendimiento
      }
    );

    // Animar los íconos con un efecto de rotación suave
    gsap.fromTo('.feature-icon',
      {
        rotate: -10,
        scale: 0.8
      },
      {
        rotate: 0,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.5)",
        stagger: 0.1,
        delay: 0.2
      }
    );
  }
}
