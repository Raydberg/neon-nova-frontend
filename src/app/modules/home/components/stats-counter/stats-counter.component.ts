import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UsersIcon, ShoppingBagIcon, AwardIcon, ThumbsUpIcon } from 'lucide-angular';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ThemeService } from '@app/core/services/theme.service';

gsap.registerPlugin(ScrollTrigger);

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
  private themeService = inject(ThemeService)

  isDarkMode = this.themeService.isDark;
  readonly UsersIcon = UsersIcon;
  readonly ShoppingBagIcon = ShoppingBagIcon;
  readonly AwardIcon = AwardIcon;
  readonly ThumbsUpIcon = ThumbsUpIcon;

  // Datos de las estadísticas

  stats: Stat[] = [
    {
      id: 1,
      value: 15000,
      label: "Clientes satisfechos",
      icon: UsersIcon,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      id: 2,
      value: 25000,
      label: "Productos vendidos",
      icon: ShoppingBagIcon,
      color: "text-green-600 dark:text-green-400",
    },
    {
      id: 3,
      value: 100,
      label: "Marcas premium",
      icon: AwardIcon,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      id: 4,
      value: 4.8,
      label: "Valoración promedio",
      icon: ThumbsUpIcon,
      color: "text-yellow-600 dark:text-yellow-400",
      decimal: true,
    }
  ];

  isVisible = signal(false);


  counts = signal(this.stats.map(stat => 0));

  private scrollTriggerInstance: ScrollTrigger | null = null;

  ngOnInit() {
    this.setupScrollTrigger();

    // Asegúrate de que este efecto se ejecute correctamente
    effect(() => {
      // Este código se ejecutará cada vez que isDarkMode cambie
      const isDark = this.isDarkMode();
      console.log('Modo oscuro cambiado:', isDark); // Para depuración
      this.updateThemeStyles(isDark);
    });
  }


  ngOnDestroy() {
    // Limpiar ScrollTrigger para evitar memory leaks
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }
  }
  private setupScrollTrigger() {
    ScrollTrigger.create({
      trigger: this.ref.nativeElement,
      start: 'top 80%',
      onEnter: () => {
        this.isVisible.set(true);
        this.animateCounters();
      },
      once: true
    });
    this.updateThemeStyles(this.isDarkMode());
  }
  private updateThemeStyles(isDark: boolean) {
    const shadowColor = isDark
      ? 'rgba(0, 0, 0, 0.3)'
      : 'rgba(0, 0, 0, 0.1)';

    // Usar setTimeout para asegurar que el DOM esté listo
    setTimeout(() => {
      // Actualizar estilos de todas las tarjetas
      const cards = this.ref.nativeElement.querySelectorAll('.stat-card');
      if (cards.length === 0) {
        console.warn('No se encontraron elementos .stat-card');
      }

      cards.forEach((card: Element) => {
        (card as HTMLElement).style.boxShadow = `0 4px 10px ${shadowColor}`;

        // Forzar la actualización de las clases dark
        if (isDark) {
          card.classList.add('dark-mode');
        } else {
          card.classList.remove('dark-mode');
        }
      });
    }, 0);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  private animateCounters() {
    if (!this.isVisible()) return;

    const self = this;

    this.stats.forEach((stat, index) => {
      const duration = 2;
      const finalValue = stat.value;

      const obj = { currentValue: 0 };

      gsap.to(obj, {
        currentValue: finalValue,
        duration: duration,
        onUpdate: function () {
          const currentValue = obj.currentValue;

          const currentCounts = self.counts();
          const newCounts = [...currentCounts];

          if (stat.decimal) {
            newCounts[index] = parseFloat(currentValue.toFixed(1));
          } else {
            newCounts[index] = Math.floor(currentValue);
          }

          self.counts.set(newCounts);
        }
      });
    });
  }

  formatNumber(value: number, decimal?: boolean): string {
    if (isNaN(value)) return '0';

    return decimal
      ? value.toFixed(1)
      : value.toLocaleString();
  }
}
