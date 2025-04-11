import { ChangeDetectionStrategy, Component, ElementRef, OnInit, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Brand {
  id: number;
  name: string;
  logo: string;
  color?: string;
}

@Component({
  selector: 'featured-brands',
  imports: [CommonModule],
  templateUrl: './featured-brands.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedBrandsComponent implements OnInit, OnDestroy {
  @ViewChild('brandsContainer', { static: false }) brandsContainer!: ElementRef;

  isVisible = signal(false);
  isMobile = signal(window.innerWidth < 768);

  brands = signal<Brand[]>([
    { id: 1, name: "Apple", logo: "assets/apple.svg", color: "#555555" },
    { id: 2, name: "Samsung", logo: "assets/samsung.svg", color: "#1428A0" },
    { id: 3, name: "Sony", logo: "assets/sony.svg", color: "#0068bf" },
    { id: 4, name: "Microsoft", logo: "assets/microsoft.svg", color: "#00a4ef" },
    { id: 5, name: "LG", logo: "assets/Lg.svg", color: "#a50034" },
    { id: 6, name: "Dell", logo: "assets/dell.svg", color: "#007db8" },
  ]);

  private observer: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;

  ngOnInit() {
    this.setupIntersectionObserver();
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
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

    setTimeout(() => {
      if (this.brandsContainer?.nativeElement) {
        this.observer!.observe(this.brandsContainer.nativeElement);
      }
    }, 100);
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(entries => {
      this.isMobile.set(window.innerWidth < 768);
    });

    this.resizeObserver.observe(document.body);
  }
}
