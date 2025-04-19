import { ChangeDetectionStrategy, Component, OnInit, signal, computed, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { LucideAngularModule } from 'lucide-angular';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductService } from '@app/core/services/product.service';
import { ProductResponseClient, Products } from '@app/core/interfaces/product-client.interface';

type SortOption = 'relevancia' | 'precio-asc' | 'precio-desc' | 'puntuacion';

@Component({
  selector: 'product-list',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ProductCardComponent,
  ],
  templateUrl: './product-list.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .product-item {
      animation: fadeIn 0.5s ease-out forwards;
    }

    .product-item:nth-child(1) { animation-delay: 0.05s; }
    .product-item:nth-child(2) { animation-delay: 0.1s; }
    .product-item:nth-child(3) { animation-delay: 0.15s; }
    .product-item:nth-child(4) { animation-delay: 0.2s; }
    .product-item:nth-child(5) { animation-delay: 0.25s; }
    .product-item:nth-child(6) { animation-delay: 0.3s; }
    .product-item:nth-child(7) { animation-delay: 0.35s; }
    .product-item:nth-child(8) { animation-delay: 0.4s; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit, OnDestroy {
  // Inyecciones
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  Math = Math;

  // Señales
  currentPage = signal(1);
  pageSize = signal(12); // Cambiado a 12 para mostrar 4x3 productos
  totalItems = signal(0);
  totalPages = signal(0);
  searchQuery = signal('');
  selectedCategory = signal<number | null>(null);
  currentSort = signal<SortOption>('relevancia');
  showFilters = signal(false);

  // Observables
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Resource para cargar productos
  loadProducts = rxResource({
    loader: () => {
      const category = this.selectedCategory();

      if (category !== null) {
      
        return this.productService.getProductsByCategoryWithFirstImage(
          category,
          this.currentPage(),
          this.pageSize(),
          this.searchQuery()
        );
      } else {
        // Si no hay categoría, usar el endpoint general
        return this.productService.getProducts(
          this.currentPage(),
          this.pageSize(),
          this.searchQuery()
        );
      }
    }
  });

  // Productos filtrados como valor calculado
  filteredProducts = computed(() => {
    if (!this.loadProducts.value()) return [];
    return this.loadProducts.value()?.items || [];
  });

  constructor() {
    // Usar effect para actualizar señales basadas en los datos cargados
    effect(() => {
      const response = this.loadProducts.value();
      if (response) {
        this.totalItems.set(response.totalItems || 0);
        this.totalPages.set(response.totalPages || 0);

        console.log('Productos cargados:', {
          items: response.items.length,
          totalItems: response.totalItems,
          totalPages: response.totalPages,
          category: this.selectedCategory()
        });
      }
    });
  }

  ngOnInit() {
    // Configuración del debounce para búsqueda
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);

      // Actualizar URL
      this.updateUrlParams();

      // Recargar productos con nueva búsqueda
      this.loadProducts.reload();
    });

    // Leer parámetros iniciales de la URL
    // Corregir la parte de queryParams.subscribe en ngOnInit()

    // Leer parámetros iniciales de la URL
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      console.log('Parámetros URL:', params);

      let shouldReload = false;

      // Procesar categoría - CORREGIDO
      if (params['categoria'] !== undefined) {
        const categoryId = Number(params['categoria']);
        console.log('Categoría de URL:', categoryId);
        if (!isNaN(categoryId) && this.selectedCategory() !== categoryId) {
          this.selectedCategory.set(categoryId);
          shouldReload = true;
        }
      } else if (this.selectedCategory() !== null) {
        this.selectedCategory.set(null);
        shouldReload = true;
      }

      // Procesar búsqueda - CORREGIDO
      if (params['buscar'] !== undefined && this.searchQuery() !== params['buscar']) {
        this.searchQuery.set(params['buscar']);
        shouldReload = true;
      } else if (params['buscar'] === undefined && this.searchQuery() !== '') {
        this.searchQuery.set('');
        shouldReload = true;
      }

      // Procesar página - CORREGIDO
      if (params['page'] !== undefined) {
        const page = Number(params['page']);
        if (!isNaN(page) && page > 0 && this.currentPage() !== page) {
          this.currentPage.set(page);
          shouldReload = true;
        }
      } else if (this.currentPage() !== 1) {
        this.currentPage.set(1);
        shouldReload = true;
      }

      // Solo recargar si realmente cambió algo
      if (shouldReload) {
        console.log('Recargando productos por cambio en URL');
        this.loadProducts.reload();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  onCategoryChange(categoryId: number | null) {
    console.log('onCategoryChange llamado con:', categoryId);

    if (this.selectedCategory() === categoryId) {
      console.log('Misma categoría, no hacemos nada');
      return;
    }

    console.log('Cambiando categoría de', this.selectedCategory(), 'a:', categoryId);
    this.selectedCategory.set(categoryId);
    this.currentPage.set(1);

    // Actualizar URL con nuevos parámetros
    if (categoryId === null) {
      // Si se selecciona "Todas", eliminamos el parámetro de categoría
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { categoria: null, page: 1 },
        queryParamsHandling: 'merge',
        // Esta opción es para que se eliminen parámetros cuando les asignas null
        replaceUrl: true
      });
    } else {
      // Si se selecciona una categoría específica
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { categoria: categoryId, page: 1 },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }

    // Forzar recarga de productos
    console.log('Forzando recarga de productos con categoría:', categoryId);
    this.loadProducts.reload();
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;

    this.currentPage.set(page);

    // Actualizar URL y recargar
    this.updateUrlParams({ page });
    this.loadProducts.reload();

    // Desplazar hacia arriba para mostrar el inicio de la lista
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSortChange(option: SortOption) {
    if (this.currentSort() === option) return;
    this.currentSort.set(option);
  }

  toggleFilters() {
    this.showFilters.update(show => !show);
  }

  getCategoryName(categoryId: number): string {
    const categories: Record<number, string> = {
      1: 'Laptops',
      2: 'Smartphones',
      3: 'Audio',
      4: 'Wearables',
      5: 'Cámaras',
      7: 'Gaming'
    };
    return categories[categoryId] || 'Otra categoría';
  }
  private updateUrlParams(additionalParams: Record<string, any> = {}) {
    const queryParams: Record<string, any> = { ...additionalParams };

    // Añadir parámetros solo si tienen valor
    const categoryId = this.selectedCategory();
    if (categoryId !== null) {
      queryParams['categoria'] = categoryId; // CORREGIDO
    }

    const search = this.searchQuery();
    if (search && search.trim() !== '') {
      queryParams['buscar'] = search; // CORREGIDO
    }

    // Solo añadir page si no está en la página 1 o si se especificó en additionalParams
    if (!('page' in additionalParams) && this.currentPage() !== 1) {
      queryParams['page'] = this.currentPage(); // CORREGIDO
    }

    console.log('Actualizando URL con params:', queryParams);

    // Navegar sin mantener parámetros antiguos
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      replaceUrl: true // Reemplazar en lugar de añadir al historial
    });
  }

  get pageNumbers(): number[] {
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();
    const pageNumbers: number[] = [];

    if (totalPages <= 7) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Mostrar siempre la primera página
      pageNumbers.push(1);

      // Si la página actual está cerca del inicio
      if (currentPage <= 4) {
        pageNumbers.push(2, 3, 4, 5);
        pageNumbers.push(-1); // Separador
      } else if (currentPage >= totalPages - 3) {
        // Si la página actual está cerca del final
        pageNumbers.push(-1); // Separador
        for (let i = totalPages - 4; i < totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Si la página actual está en el medio
        pageNumbers.push(-1); // Separador
        pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
        pageNumbers.push(-1); // Separador
      }

      // Mostrar siempre la última página
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  }

  // Ordenamiento local
  sortedProducts = computed(() => {
    const products = this.filteredProducts();
    const sortOption = this.currentSort();

    if (products.length === 0) return [];

    // Clonar el array para no mutar el original
    const sortedProducts = [...products];

    switch (sortOption) {
      case 'precio-asc':
        return sortedProducts.sort((a, b) => a.price - b.price);
      case 'precio-desc':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'puntuacion':
        return sortedProducts.sort((a, b) => (b.punctuation || 0) - (a.punctuation || 0));
      default:
        return sortedProducts; // relevancia (mantiene orden original)
    }
  });
}
