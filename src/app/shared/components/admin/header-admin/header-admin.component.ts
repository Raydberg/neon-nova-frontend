import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { ThemeService } from '@app/core/services/theme.service';
import { ChevronDownIcon, LogOutIcon, LucideAngularModule, MoonIcon, SearchIcon, SettingsIcon, SunIcon, UserIcon, UsersIcon } from 'lucide-angular';
import { filter, map } from 'rxjs';

@Component({
  selector: 'header-admin',
  imports: [LucideAngularModule],
  templateUrl: './header-admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderAdminComponent {
  readonly LogOutIcon = LogOutIcon;
  readonly SearchIcon = SearchIcon;
  readonly ChevronDownIcon = ChevronDownIcon;
  readonly UserIcon = UserIcon;

  readonly SettingsIcon = SettingsIcon;
  readonly SunIcon = SunIcon;
  readonly MoonIcon = MoonIcon;
  themeService = inject(ThemeService)
  toggleTheme(): void {
    this.themeService.toggleTheme()
  }
  isDarkMode(): boolean {
    return this.themeService.isDark()
  }
  logout(): void {
    console.log('Cerrar sesión');
  }
  router = inject(Router)
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
