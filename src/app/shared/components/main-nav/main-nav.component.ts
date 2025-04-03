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

@Component({
  selector: 'main-nav',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LucideAngularModule
  ],
  styleUrl: './main-nav.component.css',
  templateUrl: './main-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNavComponent {

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

}
