import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

interface Stat {
  id: number;
  value: number;
  label: string;
  icon: any;
  color: string;
  decimal?: boolean;
}

@Component({
  selector: 'stats-counter',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './stats-counter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsCounterComponent implements OnInit, OnDestroy {
  @ViewChild('statsSection', { static: true }) statsSection!: ElementRef;

  private ref = inject(ElementRef);

  stats: Stat[] = [
    {
      id: 1,
      value: 15000,
      label: "Clientes satisfechos",
      icon: "users",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      id: 2,
      value: 25000,
      label: "Productos vendidos",
      icon: "shopping-bag",
      color: "text-green-600 dark:text-green-400",
    },
    {
      id: 3,
      value: 100,
      label: "Marcas premium",
      icon: "award",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      id: 4,
      value: 4.8,
      label: "Valoración promedio",
      icon: "thumbs-up",
      color: "text-yellow-600 dark:text-yellow-400",
      decimal: true,
    }
  ];
  isVisible = signal(false);
  private observer: IntersectionObserver | null = null;
  private animationFrameId: number | null = null;
  private countersAnimated = false;

  ngOnInit() {
    this.setupIntersectionObserver();

  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.countersAnimated) {
          this.isVisible.set(true);
          this.animateCounters();
          this.countersAnimated = true;
        }
      });
    }, options);

    setTimeout(() => {
      if (this.statsSection?.nativeElement) {
        this.observer?.observe(this.statsSection.nativeElement);
      }
    }, 0);

  }

  private updateThemeStyles(isDark: boolean) {
    const shadowColor = isDark
      ? 'rgba(0, 0, 0, 0.3)'
      : 'rgba(0, 0, 0, 0.1)';

    setTimeout(() => {
      const cards = this.ref.nativeElement.querySelectorAll('.stat-card');
      if (cards.length === 0) {
        console.warn('No se encontraron elementos .stat-card');
      }

      cards.forEach((card: Element) => {
        (card as HTMLElement).style.boxShadow = `0 4px 10px ${shadowColor}`;

        if (isDark) {
          card.classList.add('dark-mode');
        } else {
          card.classList.remove('dark-mode');
        }
      });
    }, 0);
  }

  private animateCounters() {
    if (!this.isVisible()) return;

    const counterElements = this.ref.nativeElement.querySelectorAll('.counter-value');
    const duration = 2000; // 2 seconds in milliseconds
    const startTime = performance.now();

    const updateCounters = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      counterElements.forEach((element: HTMLElement) => {
        const target = parseFloat(element.getAttribute('data-target')!);
        const isDecimal = element.getAttribute('data-decimal') === 'true';

        let currentValue = progress * target;

        if (isDecimal) {
          element.textContent = currentValue.toFixed(1);
        } else {
          element.textContent = Math.floor(currentValue).toLocaleString();
        }
      });

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(updateCounters);
      }
    };

    this.animationFrameId = requestAnimationFrame(updateCounters);
  }

  formatNumber(value: number, decimal?: boolean): string {
    if (isNaN(value)) return '0';

    return decimal
      ? value.toFixed(1)
      : value.toLocaleString();
  }
}
