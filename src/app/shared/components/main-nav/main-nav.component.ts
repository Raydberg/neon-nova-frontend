import { ChangeDetectionStrategy, Component, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {  LucideAngularModule} from 'lucide-angular';
import { filter } from 'rxjs/operators';
import { ThemeService } from '@app/core/services/theme.service';
import { AuthService } from '@app/core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { UserProfile } from '@app/core/models/user-profile.model';
import { environment } from '@environments/environment';

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

  cartItemCount = signal(2);
  isMobileMenuOpen = signal(false);
  isScrolled = signal(false);

  isDarkMode = this.themeService.isDark;

  // readonly HeartIcon = HeartIcon;
  // readonly MenuIcon = MenuIcon;
  // readonly SearchIcon = SearchIcon;
  // readonly ShoppingCartIcon = ShoppingCartIcon;
  // readonly UserIcon = UserIcon;
  // readonly XIcon = XIcon;
  // readonly ChevronDownIcon = ChevronDownIcon;
  // readonly SunIcon = SunIcon;
  // readonly MoonIcon = MoonIcon;
  // readonly PackageIcon = PackageIcon;
  // readonly SettingsIcon = SettingsIcon;
  // readonly LogOutIcon = LogOutIcon;
  authService = inject(AuthService);
  private http = inject(HttpClient);
  userProfile = signal<UserProfile | null>(null);
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
      this.loadUserProfile();
    }

  }


  loadUserProfile() {
    this.http.get<UserProfile>(`${environment.apiUrl}/user/current`)
      .subscribe({
        next: (profile) => this.userProfile.set(profile),
        error: (err) => console.error('Error loading user profile:', err)
      });
  }
  getUserName(): string {
    return this.userProfile()?.name || 'Usuario';
  }
  getUserInitials(): string {
    const name = this.userProfile()?.name;
    if (!name) return 'U';

    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return parts[0].substring(0, 2).toUpperCase();
  }
  logout() {
    this.authService.logout();
    this.userProfile.set(null);
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
