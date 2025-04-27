import {ChangeDetectionStrategy, Component, effect, HostListener, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';
import {filter} from 'rxjs/operators';
import {ThemeService} from '@app/core/services/theme.service';
import {AuthService} from '@app/core/services/auth.service';
import {UserService} from '@app/core/services/user.service';
import {CartService} from '@core/services/cart.service';
import {rxResource} from '@angular/core/rxjs-interop';
import {CartShopClient, Detail} from '@core/models/cart-shop.model';

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
  private themeService = inject(ThemeService);
  authService = inject(AuthService);
  userService = inject(UserService);
  private readonly cartService = inject(CartService)

  cartResource = rxResource({
    loader: () => this.cartService.getAllCartShop()
  })

  cartItemCount = signal<Detail[]>([]);
  cart = signal<CartShopClient | null>(null)

  isMobileMenuOpen = signal(false);
  isScrolled = signal(false);
  isDarkMode = this.themeService.isDark;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 10);
  }

  constructor(private router: Router) {
    effect(() => {
      const result = this.cartResource.value()
      if (result && result.details) {
        this.cartItemCount.set(result.details || 0)
      }
    });
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobileMenuOpen()) {
        this.isMobileMenuOpen.set(false);
      }
    });

    if (this.authService.isLoggedIn()) {
      this.userService.fetchCurrentUser().subscribe();
    }
  }

  logout() {
    this.authService.logout();
    this.userService.clearUserProfile();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  closeMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
