import { ChangeDetectionStrategy, Component, signal, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
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

  constructor() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode.set(prefersDark);

    this.applyTheme(prefersDark);

    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
  }



  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
  }

  toggleTheme() {
    this.isDarkMode.update(value => !value);
  }

  private applyTheme(isDark: boolean) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }
}
