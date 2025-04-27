import { ChangeDetectionStrategy, Component, ElementRef, OnInit, OnDestroy, ViewChild, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Brand {
  id: number;
  name: string;
  logo: string;
  logoLight?: string; // Optional light version of logo
  logoDark?: string;  // Optional dark version of logo
  color: string;
  colorDark: string; // Color for dark mode
}

@Component({
  selector: 'featured-brands',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-brands.component.html',
  styleUrl: './featured-brands.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedBrandsComponent implements OnInit, OnDestroy {
  @ViewChild('brandsContainer', { static: false }) brandsContainer!: ElementRef;

  isVisible = signal(false);
  isMobile = signal(window.innerWidth < 768);
  isDarkMode = signal(this.detectDarkMode());

  brands = signal<Brand[]>([
    {
      id: 1,
      name: "Apple",
      logo: "assets/apple.svg",
      color: "#555555",
      colorDark: "#f5f5f7"
    },
    {
      id: 2,
      name: "Samsung",
      logo: "assets/samsung.svg",
      color: "#1428A0",
      colorDark: "#4e63d3"
    },
    {
      id: 3,
      name: "Sony",
      logo: "assets/sony.svg",
      color: "#0068bf",
      colorDark: "#4da5ff"
    },
    {
      id: 4,
      name: "Microsoft",
      logo: "assets/microsoft.svg",
      color: "#00a4ef",
      colorDark: "#4cc9ff"
    },
    {
      id: 5,
      name: "LG",
      logo: "assets/lg.svg",
      color: "#a50034",
      colorDark: "#ff5c88"
    },
  ]);

  private observer: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private darkModeMediaQuery: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
  private themeObserver: MutationObserver | null = null;

  ngOnInit() {
    this.setupIntersectionObserver();
    this.setupResizeObserver();
    this.setupDarkModeListener();
    this.setupThemeObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }

    // Remove media query listener
    this.darkModeMediaQuery.removeEventListener('change', this.handleDarkModeChange);
  }

  getBrandColor(brand: Brand): string {
    return this.isDarkMode() ? brand.colorDark : brand.color;
  }

  getLogo(brand: Brand): string {
    if (this.isDarkMode() && brand.logoDark) {
      return brand.logoDark;
    }
    if (!this.isDarkMode() && brand.logoLight) {
      return brand.logoLight;
    }
    return brand.logo;
  }

  getImageFilter(): string {
    return this.isDarkMode()
      ? 'brightness(0.9) grayscale(0.5)'
      : 'grayscale(0.7)';
  }

  private handleDarkModeChange = (e: MediaQueryListEvent) => {
    this.isDarkMode.set(this.detectDarkMode());
  }

  private detectDarkMode(): boolean {
    // Check for data-theme attribute on html element (DaisyUI approach)
    const htmlElement = document.documentElement;
    const dataTheme = htmlElement.getAttribute('data-theme');

    if (dataTheme) {
      return dataTheme.includes('dark');
    }

    // Fallback to media query
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private setupDarkModeListener() {
    this.darkModeMediaQuery.addEventListener('change', this.handleDarkModeChange);
  }

  private setupThemeObserver() {
    // Watch for changes in the data-theme attribute (DaisyUI theme changes)
    this.themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          this.isDarkMode.set(this.detectDarkMode());
        }
      });
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
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
