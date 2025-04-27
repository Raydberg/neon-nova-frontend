import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

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
export class WhyChooseUsComponent implements OnInit, OnDestroy {
  @ViewChild('featuresContainer', { static: false }) featuresContainer!: ElementRef;
  isVisible = signal(false);

  private observer: IntersectionObserver | null = null;

  features: Feature[] = [
    {
      id: 1,
      title: "Productos garantizados",
      description: "Todos nuestros productos cuentan con garantía oficial del fabricante",
      icon: "shield-check",
      color: "text-blue-600 bg-blue-100",
    },
    {
      id: 2,
      title: "Envío rápido",
      description: "Entrega en 24-48 horas a todo el país",
      icon: "truck",
      color: "text-green-600 bg-green-100",
    },
    {
      id: 3,
      title: "Pago seguro",
      description: "Múltiples métodos de pago con la máxima seguridad",
      icon: "credit-card",
      color: "text-purple-600 bg-purple-100",
    },
    {
      id: 4,
      title: "Soporte 24/7",
      description: "Atención al cliente disponible todos los días",
      icon: "life-buoy",
      color: "text-red-600 bg-red-100",
    },
  ];

  ngOnInit() {

    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 100);
  }

  ngOnDestroy() {

    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver() {
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

    if (this.featuresContainer?.nativeElement) {
      this.observer.observe(this.featuresContainer.nativeElement);
    }
  }
}
