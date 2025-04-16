import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router, NavigationEnd, RouterModule, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import {
  BarChart3Icon,
  BoxIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingCartIcon,
  TagIcon,
  UsersIcon,
  BellIcon,
  SearchIcon,
  ChevronDownIcon,
  UserIcon,
  MoonIcon,
  InboxIcon,
  CheckIcon,
  InfoIcon,
  XIcon,
} from 'lucide-angular';

interface AppLink {
  name: string;
  href: string;
  icon: any;
}

@Component({
  selector: 'admin-layout',
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    LucideAngularModule,
    RouterModule, RouterLink, RouterLinkActive
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  // Icons
  readonly LayoutDashboardIcon = LayoutDashboardIcon;
  readonly PackageIcon = PackageIcon;
  readonly TagIcon = TagIcon;
  readonly ShoppingCartIcon = ShoppingCartIcon;
  readonly UsersIcon = UsersIcon;
  readonly CreditCardIcon = CreditCardIcon;
  readonly BarChart3Icon = BarChart3Icon;
  readonly SettingsIcon = SettingsIcon;
  readonly MenuIcon = MenuIcon;
  readonly BoxIcon = BoxIcon;
  readonly LogOutIcon = LogOutIcon;
  readonly BellIcon = BellIcon;
  readonly SearchIcon = SearchIcon;
  readonly ChevronDownIcon = ChevronDownIcon;
  readonly UserIcon = UserIcon;
  readonly MoonIcon = MoonIcon;
  readonly InboxIcon = InboxIcon;
  readonly CheckIcon = CheckIcon;
  readonly InfoIcon = InfoIcon;
  readonly XIcon = XIcon;

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
      icon: LayoutDashboardIcon,
      href: "/admin",
      active: (path: string) => path === "/admin" || path === "/admin/"
    },
    {
      label: "Productos",
      icon: PackageIcon,
      href: "/admin/products",
      active: (path: string) => path === "/admin/products" || path.startsWith("/admin/products/")
    },
    {
      label: "Categorías",
      icon: TagIcon,
      href: "/admin/categories",
      active: (path: string) => path === "/admin/categories" || path.startsWith("/admin/categories/")
    },
    {
      label: "Usuarios",
      icon: UsersIcon,
      href: "/admin/users",
      active: (path: string) => path === "/admin/users" || path.startsWith("/admin/users/")
    },
  ];

  apps: AppLink[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboardIcon },
    { name: 'Tienda', href: '/', icon: ShoppingCartIcon },
    { name: 'Usuarios', href: '/admin/users', icon: UsersIcon }
  ];



  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        console.log('Ruta actual:', this.router.url);
      });
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }

  logout(): void {
    console.log('Cerrar sesión');
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

  getCurrentPageTitle(): string {
    const path = this.currentPath() || '';
    const route = this.routes.find(r => r.active(path));
    return route?.label || 'Dashboard';
  }
}
