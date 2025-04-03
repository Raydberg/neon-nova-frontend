import { ChangeDetectionStrategy, Component, signal, HostListener, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs/operators';
import {
  HeartIcon,
  MenuIcon,
  SearchIcon,
  ShoppingCartIcon,
  UserIcon,
  XIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon
} from 'lucide-angular';
import { gsap } from 'gsap';

@Component({
  selector: 'main-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './main-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNavComponent {
  @ViewChild('mobileMenu') mobileMenu!: ElementRef;
  @ViewChild('mobileMenuOverlay') mobileMenuOverlay!: ElementRef;

  cartItemCount = signal(2);
  isMobileMenuOpen = signal(false);
  isScrolled = signal(false);
  isDarkMode = signal(false);

  readonly HeartIcon = HeartIcon;
  readonly MenuIcon = MenuIcon;
  readonly SearchIcon = SearchIcon;
  readonly ShoppingCartIcon = ShoppingCartIcon;
  readonly UserIcon = UserIcon;
  readonly XIcon = XIcon;
  readonly ChevronDownIcon = ChevronDownIcon;
  readonly SunIcon = SunIcon;
  readonly MoonIcon = MoonIcon;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 10);
  }

  constructor(private router: Router) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode.set(prefersDark);

    this.applyTheme(prefersDark);

    effect(() => {
      this.applyTheme(this.isDarkMode());
    });

    effect(() => {
      if (this.isMobileMenuOpen() && this.mobileMenu) {
        this.animateMenuOpen();
      } else if (!this.isMobileMenuOpen() && this.mobileMenu) {
        this.animateMenuClose();
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobileMenuOpen()) {
        this.isMobileMenuOpen.set(false);
      }
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
  }

  toggleTheme() {
    this.isDarkMode.update(value => !value);
  }

  closeMenu() {
    this.isMobileMenuOpen.set(false);
  }

  private applyTheme(isDark: boolean) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }

  private animateMenuOpen() {
    gsap.set(this.mobileMenuOverlay.nativeElement, { opacity: 0 });
    gsap.set(this.mobileMenu.nativeElement, { x: '100%' });

    // Luego animamos
    const tl = gsap.timeline();
    tl.to(this.mobileMenuOverlay.nativeElement, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out'
    })
    .to(this.mobileMenu.nativeElement, {
      x: '0%',
      duration: 0.4,
      ease: 'power3.out'
    }, '-=0.1')
    .fromTo('.mobile-menu-item', {
      opacity: 0,
      x: 20
    }, {
      opacity: 1,
      x: 0,
      stagger: 0.05,
      duration: 0.3,
      ease: 'power2.out'
    }, '-=0.2');
  }

  private animateMenuClose() {
    const tl = gsap.timeline({
      onComplete: () => {

      }
    });

    tl.to(this.mobileMenu.nativeElement, {
      x: '100%',
      duration: 0.3,
      ease: 'power3.in'
    })
    .to(this.mobileMenuOverlay.nativeElement, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in'
    }, '-=0.1');
  }
}
