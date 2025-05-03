import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router, NavigationEnd, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeService } from '@app/core/services/theme.service';
import { HeaderAdminComponent } from "../../components/admin/header-admin/header-admin.component";
import { AuthService } from '@app/core/services/auth.service';
import { UserService } from '@app/core/services/user.service';

interface AppLink {
  name: string;
  href: string;
  icon: string;
}

@Component({
  selector: 'admin-layout',
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    LucideAngularModule,
    RouterLink, RouterLinkActive,
    HeaderAdminComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  private themeService = inject(ThemeService);
  protected authService = inject(AuthService);
  protected userService = inject(UserService);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkMode(): boolean {
    return this.themeService.isDark();
  }

  isSidebarOpen = signal(true);
  router = inject(Router);

  currentPath = toSignal<string>(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    )
  );

  window = window;

  routes = [
    {
      label: "Dashboard",
      icon: "layout-dashboard",
      href: "/admin"
    },
    {
      label: "Productos",
      icon: "package",
      href: "/admin/products"
    },
    {
      label: "Categorías",
      icon: "tag",
      href: "/admin/categories"
    },
    {
      label: "Usuarios",
      icon: "users",
      href: "/admin/users"
    },
  ];

  apps: AppLink[] = [
    { name: 'Dashboard', href: '/admin', icon: 'layout-dashboard' },
    { name: 'Tienda', href: '/', icon: 'shopping-cart' },
    { name: 'Usuarios', href: '/admin/users', icon: 'users' }
  ];

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd));

    // Cargar perfil de usuario si aún no está cargado
    if (this.authService.isLoggedIn() && !this.userService.getUserProfile()()) {
      this.userService.fetchCurrentUser().subscribe();
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  closeSidebar(event: MouseEvent): void {
    if (window.innerWidth < 768) {
      setTimeout(() => {
        this.isSidebarOpen.set(false);
      }, 150);
    }
  }

  isActiveRoute(routePath: string): boolean {
    const currentPath = this.router.url;

    if (routePath === '/admin') {
      return currentPath === '/admin' || currentPath === '/admin/';
    }

    return currentPath.startsWith(routePath);
  }
}
