import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { gsap } from 'gsap';
import { LucideAngularModule, MailIcon, CheckIcon } from 'lucide-angular';

@Component({
  selector: 'news-letter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './news-letter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsLetterComponent implements OnInit {
  @ViewChild('newsletterContainer', { static: false }) newsletterContainer!: ElementRef;
  @ViewChild('formContainer', { static: false }) formContainer!: ElementRef;

  // Iconos
  readonly MailIcon = MailIcon;
  readonly CheckIcon = CheckIcon;

  // Señales y estado reactivo
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  isSubmitted = signal(false);

  // Animación de la suscripción
  animation = {
    timeline: null as gsap.core.Timeline | null,
    complete: signal(false)
  };

  ngOnInit() {
    // Inicializar GSAP con contexto
  }

  ngAfterViewInit() {
    // Configurar animaciones después de que el DOM esté listo
    setTimeout(() => {
      this.setupInitialAnimation();
    }, 100);
  }

  onSubmit() {
    if (this.emailControl.valid) {
      // Animación de envío
      this.playSubmitAnimation();

      // Simular envío al servidor
      this.isSubmitted.set(true);

      // Restaurar después de 3 segundos
      setTimeout(() => {
        this.isSubmitted.set(false);
        this.emailControl.setValue('');
        this.emailControl.markAsUntouched();
      }, 3000);
    } else {
      // Marcar campo como tocado para mostrar errores
      this.emailControl.markAsTouched();

      // Animación de error
      this.playErrorAnimation();
    }
  }

  private setupInitialAnimation() {
    if (!this.newsletterContainer) return;

    // Animación de entrada principal
    gsap.from(this.newsletterContainer.nativeElement, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: this.newsletterContainer.nativeElement,
        start: "top 80%",
        once: true
      }
    });

    // Animación secuencial de los elementos internos
    const elements = this.newsletterContainer.nativeElement.querySelectorAll('.animate-item');
    gsap.from(elements, {
      y: 20,
      opacity: 0,
      stagger: 0.15,
      duration: 0.7,
      ease: "back.out(1.5)",
      delay: 0.3,
      scrollTrigger: {
        trigger: this.newsletterContainer.nativeElement,
        start: "top 80%",
        once: true
      }
    });
  }

  private playSubmitAnimation() {
    // Crear la animación de éxito con GSAP
    const timeline = gsap.timeline();

    timeline
      .to(this.formContainer.nativeElement, {
        scale: 1.03,
        duration: 0.2,
        ease: "back.out(1.5)"
      })
      .to(this.formContainer.nativeElement, {
        scale: 1,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)"
      });

    if (this.newsletterContainer) {
      const container = this.newsletterContainer.nativeElement;

      for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-2 h-2 rounded-full bg-primary';
        container.appendChild(particle);

        const button = this.formContainer.nativeElement.querySelector('button');
        const rect = button.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top + rect.height / 2;

        gsap.fromTo(particle,
          {
            x,
            y,
            scale: 0,
            opacity: 1
          },
          {
            x: x + (Math.random() - 0.5) * 100,
            y: y + (Math.random() - 0.5) * 100,
            scale: Math.random() * 1.5,
            opacity: 0,
            duration: 0.6 + Math.random() * 0.5,
            ease: "power2.out",
            onComplete: () => {
              if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
              }
            }
          }
        );
      }
    }
  }

  private playErrorAnimation() {
    const emailInput = this.formContainer.nativeElement.querySelector('input');

    gsap.fromTo(emailInput,
      { x: 0 },
      {
        x: [-10, 10, -8, 8, -5, 5, 0] as any,
        duration: 0.5,
        ease: "power2.out"
      }
    );
  }
}
