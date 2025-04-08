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
  BellIcon,
  SearchIcon,
  LayoutGridIcon,
  ChevronDownIcon,
  UserIcon,
  MoonIcon,
  InboxIcon,
  CheckIcon,
  AlertCircleIcon,
  InfoIcon,
} from 'lucide-angular';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppLink {
  name: string;
  href: string;
  icon: any;
}

@Component({
  selector: 'admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    LucideAngularModule,
  ],
  templateUrl: './admin-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  // Icons (originales)
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

  // Nuevos iconos para el navbar
  readonly BellIcon = BellIcon;
  readonly SearchIcon = SearchIcon;
  readonly LayoutGridIcon = LayoutGridIcon;
  readonly ChevronDownIcon = ChevronDownIcon;
  readonly UserIcon = UserIcon;
  readonly MoonIcon = MoonIcon;
  readonly InboxIcon = InboxIcon;
  readonly CheckIcon = CheckIcon;
  readonly AlertCircleIcon = AlertCircleIcon;
  readonly InfoIcon = InfoIcon;

  // State
  isSidebarOpen = signal(true);

  // Navbar state
  notifications = signal<Notification[]>([
    {
      id: 1,
      title: 'Nuevo pedido recibido',
      message: 'Tienes un nuevo pedido #1234 para procesar',
      time: new Date(Date.now() - 2 * 60 * 1000), // 2 minutos atrás
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'Pago completado',
      message: 'El pago del pedido #1233 ha sido procesado',
      time: new Date(Date.now() - 45 * 60 * 1000), // 45 minutos atrás
      read: false,
      type: 'success'
    },
    {
      id: 3,
      title: 'Stock bajo',
      message: 'El producto "Laptop Pro X" está con stock bajo',
      time: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 horas atrás
      read: true,
      type: 'warning'
    },
    {
      id: 4,
      title: 'Error en el sistema',
      message: 'Hubo un error al procesar el pedido #1232',
      time: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
      read: true,
      type: 'error'
    }
  ]);

  unreadNotifications = signal(2);

  // Links de apps
  apps: AppLink[] = [
    { name: 'Ventas', href: '/admin', icon: ShoppingCartIcon },
    { name: 'Inventario', href: '/admin/products', icon: PackageIcon },
    { name: 'Clientes', href: '/admin/users', icon: UsersIcon },
    { name: 'Informes', href: '/admin/reports', icon: BarChart3Icon },
    { name: 'Config', href: '/admin/settings', icon: SettingsIcon },
    { name: 'Ayuda', href: '/admin/help', icon: InfoIcon }
  ];

  // Router
  private router = inject(Router);
  currentPath = toSignal<string>(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url)
    )
  );

  window = window;

  // Routes configuration (original)
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
    // {
    //   label: "Pedidos",
    //   icon: ShoppingCartIcon,
    //   href: "/admin/orders",
    //   active: (path: string) => path === "/admin/orders" || path.startsWith("/admin/orders/")
    // },
    {
      label: "Usuarios",
      icon: UsersIcon,
      href: "/admin/users",
      active: (path: string) => path === "/admin/users" || path.startsWith("/admin/users/")
    },
    // {
    //   label: "Transacciones",
    //   icon: CreditCardIcon,
    //   href: "/admin/transactions",
    //   active: (path: string) => path === "/admin/transactions"
    // },
    // {
    //   label: "Informes",
    //   icon: BarChart3Icon,
    //   href: "/admin/reports",
    //   active: (path: string) => path === "/admin/reports"
    // },
    // {
    //   label: "Configuración",
    //   icon: SettingsIcon,
    //   href: "/admin/settings",
    //   active: (path: string) => path === "/admin/settings"
    // },
  ];

  toggleSidebar() {
    this.isSidebarOpen.update(value => !value);
  }

  logout() {
    // Implement your logout logic here
    console.log('Logging out...');
  }

  // Métodos para el navbar
  getCurrentPageTitle(): string {
    const path = this.currentPath() || '';
    const route = this.routes.find(r => r.active(path));
    return route ? route.label : 'Dashboard';
  }

  markAllAsRead() {
    this.notifications.update(notifs =>
      notifs.map(n => ({ ...n, read: true }))
    );
    this.unreadNotifications.set(0);
  }

  getNotificationIcon(type: string): any {
    switch (type) {
      case 'success': return this.CheckIcon;
      case 'warning': return this.AlertCircleIcon;
      case 'error': return this.AlertCircleIcon;
      case 'info':
      default: return this.InfoIcon;
    }
  }

  getNotificationIconClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'error': return 'bg-error';
      case 'info':
      default: return 'bg-info';
    }
  }
}
