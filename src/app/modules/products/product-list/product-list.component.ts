import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  computed,
  inject,
  effect,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductService } from '@app/core/services/product.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterBarComponent } from '../components/filter-bar/filter-bar.component';
import { CategoryFilterComponent } from '../components/category-filter/category-filter.component';
import { ProductSearchComponent } from "../product-search/product-search.component";

export type SortOption = 'relevancia' | 'precio-asc' | 'precio-desc' | 'puntuacion';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ProductCardComponent,
    PaginationComponent,
    FilterBarComponent,
    CategoryFilterComponent,
    ProductSearchComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected sortOptions: SortOption[] = ['relevancia', 'precio-asc', 'precio-desc', 'puntuacion'];
  protected Math = Math;

  protected currentPage = signal(1);
  protected pageSize = signal(12);
  protected totalItems = signal(0);
  protected totalPages = signal(0);
  protected searchQuery = signal('');
  protected selectedCategory = signal<number | null>(null);
  protected currentSort = signal<SortOption>('relevancia');
  protected showFilters = signal(false);
  private reloadWithDebounce = signal(0);

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  protected loadProducts = rxResource({
    loader: () => {
      const category = this.selectedCategory();
      const page = this.currentPage();
      const size = this.pageSize();
      const query = this.searchQuery();

      console.log('Cargando productos con:', {
        category,
        page,
        size,
        query
      });

      if (category !== null) {
        return this.productService.getProductsByCategoryWithFirstImage(
          category, page, size, query
        );
      } else {
        return this.productService.getProducts(page, size, query);
      }
    },
  });

  // Este es el método principal que debe manejar los cambios del componente de búsqueda
  handleSearchChange(query: string): void {
    console.log('Search query changed:', query);
    this.searchSubject.next(query);
  }

  protected filteredProducts = computed(() => this.loadProducts.value()?.items || []);

  protected sortedProducts = computed(() => {
    const products = this.filteredProducts();
    const sortOption = this.currentSort();

    if (products.length === 0) return [];

    const sortedProducts = [...products];

    switch (sortOption) {
      case 'precio-asc':
        return sortedProducts.sort((a, b) => a.price - b.price);
      case 'precio-desc':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'puntuacion':
        return sortedProducts.sort((a, b) => (b.punctuation || 0) - (a.punctuation || 0));
      default:
        return sortedProducts;
    }
  });

  constructor() {
    this.setupPagination();

    effect(() => {
      const _ = this.reloadWithDebounce();
      this.loadProducts.reload();
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.setupSearchHandling();
    this.setupRouteParamHandling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(query: string): void {
    console.log('onSearch called with:', query);
    this.searchSubject.next(query);
  }

  onSortChange(option: SortOption): void {
    this.currentSort.set(option);
  }

  toggleFilters(): void {
    this.showFilters.update(value => !value);
  }

  onCategoryChange(categoryId: number | null): void {
    if (this.selectedCategory() === categoryId) return;

    console.log('Category changed to:', categoryId);
    this.selectedCategory.set(categoryId);
    this.currentPage.set(1);
    this.updateUrlParams();
    this.triggerReload();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;

    console.log('Page changed to:', page);
    this.currentPage.set(page);
    this.updateUrlParams({ page });
    this.triggerReload();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getCategoryName(categoryId: number): string {
    const categories = {
      1: 'Laptops',
      2: 'Smartphones',
      3: 'Audio',
      4: 'Wearables',
      5: 'Cámaras',
      7: 'Gaming'
    };
    return categories[categoryId as keyof typeof categories] || 'Otra categoría';
  }

  // For better performance with @for
  trackProduct(index: number, product: any): number {
    return product.id;
  }

  // Private methods for internal logic
  private setupPagination(): void {
    effect(() => {
      const response = this.loadProducts.value();
      if (response) {
        this.totalItems.set(response.totalItems || 0);
        this.totalPages.set(response.totalPages || 0);
      }
    });
  }

  private setupSearchHandling(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      console.log('Processing search query after debounce:', query);
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.updateUrlParams();
      this.triggerReload();
    });
  }

  private setupRouteParamHandling(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      console.log('Route params changed:', params);
      let shouldReload = false;

      // Handle category change from URL
      if (params['categoria'] !== undefined) {
        const categoryId = Number(params['categoria']);
        if (!isNaN(categoryId) && this.selectedCategory() !== categoryId) {
          this.selectedCategory.set(categoryId);
          shouldReload = true;
        }
      } else if (this.selectedCategory() !== null) {
        this.selectedCategory.set(null);
        shouldReload = true;
      }

      // Handle search change from URL
      if (params['buscar'] !== undefined && this.searchQuery() !== params['buscar']) {
        console.log('Setting search query from URL:', params['buscar']);
        this.searchQuery.set(params['buscar']);
        shouldReload = true;
      } else if (params['buscar'] === undefined && this.searchQuery() !== '') {
        this.searchQuery.set('');
        shouldReload = true;
      }

      // Handle page change from URL
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

      if (shouldReload) {
        console.log('Triggering reload due to URL params change');
        this.triggerReload();
      }
    });
  }

  private triggerReload(): void {
    this.reloadWithDebounce.update(val => val + 1);
  }

  private updateUrlParams(additionalParams: Record<string, any> = {}): void {
    const queryParams: Record<string, any> = { ...additionalParams };

    const categoryId = this.selectedCategory();
    if (categoryId !== null) {
      queryParams['categoria'] = categoryId;
    }

    const search = this.searchQuery();
    if (search?.trim()) {
      queryParams['buscar'] = search;
    }

    if (!('page' in additionalParams) && this.currentPage() > 1) {
      queryParams['page'] = this.currentPage();
    }

    console.log('Updating URL with params:', queryParams);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }
}
