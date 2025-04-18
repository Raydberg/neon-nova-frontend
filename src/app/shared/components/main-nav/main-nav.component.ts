import { ChangeDetectionStrategy, Component, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs/operators';
import { ThemeService } from '@app/core/services/theme.service';
import { AuthService } from '@app/core/services/auth.service';
import { UserService } from '@app/core/services/user.service';

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

  cartItemCount = signal(2);
  isMobileMenuOpen = signal(false);
  isScrolled = signal(false);
  isDarkMode = this.themeService.isDark;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 10);
  }

  constructor(private router: Router) {
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
