import { ChangeDetectionStrategy, Component, ElementRef, OnInit, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'news-letter',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './news-letter.component.html',
  styleUrl:"./news-letter.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsLetterComponent implements OnInit, OnDestroy {
  @ViewChild('newsletterContainer', { static: false }) newsletterContainer!: ElementRef;
  @ViewChild('formContainer', { static: false }) formContainer!: ElementRef;

  emailControl = new FormControl('', [Validators.required, Validators.email]);
  isSubmitted = signal(false);
  isVisible = signal(false);

  private observer: IntersectionObserver | null = null;
  private animationTimeout: any = null;

  ngOnInit() {
    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 100);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
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
      threshold: 0.2,
      rootMargin: '0px 0px -20% 0px'
    });

    if (this.newsletterContainer?.nativeElement) {
      this.observer.observe(this.newsletterContainer.nativeElement);
    }
  }

  onSubmit() {
    if (this.emailControl.valid) {
      // Simular envío al servidor
      this.isSubmitted.set(true);

      // Restaurar después de 3 segundos
      this.animationTimeout = setTimeout(() => {
        this.isSubmitted.set(false);
        this.emailControl.setValue('');
        this.emailControl.markAsUntouched();
      }, 3000);
    } else {
      // Marcar campo como tocado para mostrar errores
      this.emailControl.markAsTouched();

      // Añadir clase para animación de error
      const input = this.formContainer?.nativeElement.querySelector('input');
      if (input) {
        input.classList.add('shake-animation');
        setTimeout(() => input.classList.remove('shake-animation'), 500);
      }
    }
  }
}
