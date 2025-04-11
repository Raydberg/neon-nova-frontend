import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  styleUrl: './promo-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoBannerComponent implements OnInit, OnDestroy {
  @ViewChild('promoBanner', { static: false }) promoBanner!: ElementRef;
  @ViewChild('promoImage', { static: false }) promoImage!: ElementRef;

  private endDate = new Date();
  private interval: any;

  timeLeft = signal<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  isVisible = signal(false);

  bannerGradient = signal('bg-gradient-to-r from-purple-600 to-indigo-700');

  discountPercent = signal(30);

  promoImageSrc = signal('https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1057&q=80');

  private observer: IntersectionObserver | null = null;

  constructor() {
    this.endDate.setDate(this.endDate.getDate() + 2);
    this.endDate.setHours(this.endDate.getHours() + 15);
  }

  ngOnInit() {
    this.startCountdown();

    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 100);
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }

    // Limpiar el observer
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private startCountdown() {
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
        if (this.interval) {
          clearInterval(this.interval);
        }
      }
    };

    calculateTimeLeft();

    this.interval = setInterval(calculateTimeLeft, 1000);
  }

  private setupIntersectionObserver() {
    if (!this.promoBanner?.nativeElement) return;

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

    this.observer.observe(this.promoBanner.nativeElement);
  }

  padNumber(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }
}
