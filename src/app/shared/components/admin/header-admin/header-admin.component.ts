import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Add this import
import { RouterModule } from '@angular/router'; // Add RouterModule for routerLink
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { ThemeService } from '@app/core/services/theme.service';
import { ChevronDownIcon, LogOutIcon,  ShoppingBag as StoreIcon,LucideAngularModule, MoonIcon, SearchIcon, SettingsIcon, SunIcon, UserIcon } from 'lucide-angular';
import { filter, map } from 'rxjs';
import { AuthService } from '@app/core/services/auth.service';
import { UserService } from '@app/core/services/user.service';

@Component({
  selector: 'header-admin',
  standalone: true, // Make sure this is a standalone component
  imports: [
    CommonModule, // Add CommonModule to fix ngClass
    LucideAngularModule,
    RouterModule // Add RouterModule for routerLink
  ],
  templateUrl: './header-admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderAdminComponent {
  readonly LogOutIcon = LogOutIcon;
  StoreIcon = StoreIcon;
  readonly SearchIcon = SearchIcon;
  readonly ChevronDownIcon = ChevronDownIcon;
  readonly UserIcon = UserIcon;
  readonly SettingsIcon = SettingsIcon;
  readonly SunIcon = SunIcon;
  readonly MoonIcon = MoonIcon;

  // Inject services
  private themeService = inject(ThemeService);
  private router = inject(Router);
  protected authService = inject(AuthService);
  protected userService = inject(UserService);

  constructor() {
    // Load user profile if not already loaded
    if (this.authService.isLoggedIn() && !this.userService.getUserProfile()()) {
      this.userService.fetchCurrentUser().subscribe();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkMode(): boolean {
    return this.themeService.isDark();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  currentPath = toSignal<string>(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    )
  );

  getCurrentPageTitle(): string {
    const path = this.currentPath() || '';

    if (path === '/admin' || path === '/admin/') return 'Dashboard';
    if (path.startsWith('/admin/products')) return 'Productos';
    if (path.startsWith('/admin/categories')) return 'Categorías';
    if (path.startsWith('/admin/users')) return 'Usuarios';

    return 'Dashboard';
  }
}
