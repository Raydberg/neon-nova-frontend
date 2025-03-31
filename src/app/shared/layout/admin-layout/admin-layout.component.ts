import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
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
} from 'lucide-angular';
import { MainNavComponent } from "../../components/main-nav/main-nav.component";

@Component({
  selector: 'admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    LucideAngularModule,
    MainNavComponent
],
  templateUrl: './admin-layout.component.html',
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

  // State
  isSidebarOpen = signal(true);

  // Router
  private router = inject(Router);
  currentPath = toSignal<string>(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    )
  );

  window = window;
  // Routes configuration
  routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboardIcon,
      href: "/admin",
      active: (path: string) => path === "/admin"
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
      label: "Pedidos",
      icon: ShoppingCartIcon,
      href: "/admin/orders",
      active: (path: string) => path === "/admin/orders" || path.startsWith("/admin/orders/")
    },
    {
      label: "Usuarios",
      icon: UsersIcon,
      href: "/admin/users",
      active: (path: string) => path === "/admin/users" || path.startsWith("/admin/users/")
    },
    {
      label: "Transacciones",
      icon: CreditCardIcon,
      href: "/admin/transactions",
      active: (path: string) => path === "/admin/transactions"
    },
    {
      label: "Informes",
      icon: BarChart3Icon,
      href: "/admin/reports",
      active: (path: string) => path === "/admin/reports"
    },
    {
      label: "Configuración",
      icon: SettingsIcon,
      href: "/admin/settings",
      active: (path: string) => path === "/admin/settings"
    },
  ];

  toggleSidebar() {
    this.isSidebarOpen.update(value => !value);
  }

  logout() {
    // Implement your logout logic here
    console.log('Logging out...');
  }
}
