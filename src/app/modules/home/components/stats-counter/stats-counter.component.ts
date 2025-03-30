import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { UsersIcon, ShoppingBagIcon, AwardIcon, ThumbsUpIcon } from 'lucide-angular';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
export class StatsCounterComponent implements OnInit {
  @ViewChild('statsSection', { static: true }) statsSection!: ElementRef;

  private el = inject(ElementRef);


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
      color: "text-blue-600",
    },
    {
      id: 2,
      value: 25000,
      label: "Productos vendidos",
      icon: ShoppingBagIcon,
      color: "text-green-600",
    },
    {
      id: 3,
      value: 100,
      label: "Marcas premium",
      icon: AwardIcon,
      color: "text-purple-600",
    },
    {
      id: 4,
      value: 4.8,
      label: "Valoración promedio",
      icon: ThumbsUpIcon,
      color: "text-yellow-600",
      decimal: true,
    }
  ];

  isVisible = signal(false);
  counts = signal(this.stats.map(stat => 0));

  ngOnInit() {
    this.setupScrollTrigger();
  }

  private setupScrollTrigger() {
    ScrollTrigger.create({
      trigger: this.el.nativeElement,
      start: 'top 80%',
      onEnter: () => {
        this.isVisible.set(true);
        this.animateCounters();
      },
      once: true
    });

    gsap.from('.stat-card', {
      scrollTrigger: {
        trigger: this.el.nativeElement,
        start: 'top 80%'
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    });
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
        onUpdate: function() {
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
