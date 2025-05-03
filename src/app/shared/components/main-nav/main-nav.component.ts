import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';
import {debounceTime, distinctUntilChanged, filter, switchMap} from 'rxjs/operators';
import {ThemeService} from '@app/core/services/theme.service';
import {AuthService} from '@app/core/services/auth.service';
import {UserService} from '@app/core/services/user.service';
import {CartService} from '@core/services/cart.service';
import {rxResource} from '@angular/core/rxjs-interop';
import {CartShopClient} from '@core/models/cart-shop.model';
import {ProductService} from '@core/services/product.service';
import {ProductResponseClient, Products} from '@core/interfaces/product-client.interface';
import {map, Observable, of, Subject, Subscription} from 'rxjs';

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
export class MainNavComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  authService = inject(AuthService);
  userService = inject(UserService);
  private productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;

  searchQuery = signal("");
  showDropdown = signal(false);
  isSearching = signal(false);
  private searchCache = new Map<string, Products[]>();

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // cartResource = rxResource({
  //   loader: () => this.cartService.getAllCartShop()
  // });

  cart = signal<CartShopClient | null>(null);

  isMobileMenuOpen = signal(false);
  isScrolled = signal(false);
  isDarkMode = this.themeService.isDark;
  cartItemCount = this.cartService.cartItemCount;
  categoryMenuOpen = signal(false);
  categoryMenuTimeout: any = null;
  cartResource = rxResource({
    loader: () => {
      if (this.authService.isLoggedIn()) {
        return this.cartService.getAllCartShop();
      } else {
        return of(null);
      }
    },
    // autoLoad: false
  });
  showCartBadge = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Comprueba que el evento no venga del input de búsqueda ni de los resultados
    const clickedElement = event.target as HTMLElement;
    const searchInputEl = this.searchInput?.nativeElement;
    const dropdownEl = this.dropdownRef?.nativeElement;

    const isClickInside =
      (searchInputEl && searchInputEl.contains(clickedElement)) ||
      (dropdownEl && dropdownEl.contains(clickedElement)) ||
      clickedElement.closest('.dropdown-search-results');

    if (!isClickInside && this.showDropdown()) {
      this.hideDropdown();
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 10);
  }
  searchResource = rxResource({
    request: () => ({ query: this.searchQuery() }),
    loader: ({ request }) => {
      if (!request.query || request.query.trim().length < 3) {
        return of({ items: [], totalItems: 0, pageNumber: 1, pageSize: 5, totalPages: 0 });
      }
      return this.productService.getProducts(1, 5, request.query);
    }
  });
  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobileMenuOpen()) {
        this.isMobileMenuOpen.set(false);
      }
    });

    // Solo cargamos datos de perfil si el usuario está autenticado
    if (this.authService.isLoggedIn()) {
      this.userService.fetchCurrentUser().subscribe();
      // Actualizamos el estado del badge del carrito
      this.showCartBadge.set(true);
    }

    // Efecto para actualizar el estado del badge cuando cambie el estado de autenticación
    effect(() => {
      this.showCartBadge.set(this.authService.isLoggedIn());
    });
  }

  ngOnDestroy() {
    if (this.authService.isLoggedIn()) {
      this.cartService.updateCartCount();
    }

    // Limpiar el timeout si existe
    if (this.categoryMenuTimeout) {
      clearTimeout(this.categoryMenuTimeout);
    }

    // Limpiar la suscripción de búsqueda
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
  openCategoryMenu() {
    // Cancelar cualquier timeout previo para cerrar el menú
    if (this.categoryMenuTimeout) {
      clearTimeout(this.categoryMenuTimeout);
      this.categoryMenuTimeout = null;
    }
    this.categoryMenuOpen.set(true);
  }

  closeCategoryMenu() {
    // Usar un pequeño delay antes de cerrar para dar tiempo al usuario
    this.categoryMenuTimeout = setTimeout(() => {
      this.categoryMenuOpen.set(false);
    }, 500); // 500ms de delay antes de cerrar
  }

  cancelCloseMenu() {
    // Cancelar el timeout si el ratón vuelve al menú
    if (this.categoryMenuTimeout) {
      clearTimeout(this.categoryMenuTimeout);
      this.categoryMenuTimeout = null;
    }
  }
  navigateToCategory(event: Event, categoryId: number): void {
    // Prevenir el comportamiento por defecto para tener control total
    event.preventDefault();

    // Cerrar el menú móvil
    this.isMobileMenuOpen.set(false);

    // Navegar a la categoría después de un pequeño retraso para permitir la animación de cierre
    setTimeout(() => {
      this.router.navigate(['/products'], {
        queryParams: { categoria: categoryId }
      });
    }, 50);
  }
  ngOnInit(): void {
    this.cartService.updateCartCount();

    // Optimizar la suscripción de búsqueda
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.trim().length < 3) {
          return of(null);
        }

        this.isSearching.set(true);

        // Usar caché si está disponible
        if (this.searchCache.has(term)) {
          return of(this.searchCache.get(term));
        }

        // Si no está en caché, hacer la petición
        return this.productService.getProducts(1, 5, term).pipe(
          map(response => {
            this.searchCache.set(term, response.items);
            return response.items;
          })
        );
      })
    ).subscribe(results => {
      // Manejo de resultados optimizado
      this.isSearching.set(false);
    });
  }

  onSearchChange(term: string) {
    if (term.trim().length > 2) {
      this.isSearching.set(true);
      this.showDropdown.set(true);
      this.searchResource.reload(); // Recargar con el nuevo término
    } else {
      this.showDropdown.set(term.trim().length > 0);
      this.isSearching.set(false);
    }
  }

  onSearchBlur(): void {
    // Usamos setTimeout para permitir que otros eventos de clic se procesen primero
    setTimeout(() => {
      // Si el foco sigue en el dropdown o el input, no cerramos
      const activeElement = document.activeElement;
      const searchInputEl = this.searchInput?.nativeElement;
      const dropdownEl = this.dropdownRef?.nativeElement;

      if (
        activeElement && (
          (searchInputEl && searchInputEl.contains(activeElement)) ||
          (dropdownEl && dropdownEl.contains(activeElement))
        )
      ) {
        return;
      }

      this.hideDropdown();
    }, 150);
  }

  hideDropdown() {
    this.showDropdown.set(false);
  }

  performSearch() {
    if (this.searchQuery().trim()) {
      this.router.navigate(['/products'], {
        queryParams: { buscar: this.searchQuery().trim() }
      });
      this.hideDropdown();
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
