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
    CategoryFilterComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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

  private categories = signal<Record<number, string>>({
    1: 'Laptops',
    2: 'Smartphones',
    3: 'Audio',
    4: 'Wearables',
    5: 'Cámaras',
    7: 'Gaming'
  });

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Data loading with rxResource
  protected loadProducts = rxResource({
    loader: () => {
      const category = this.selectedCategory();
      const page = this.currentPage();
      const size = this.pageSize();
      const query = this.searchQuery();

      if (category !== null) {
        return this.productService.getProductsByCategoryWithFirstImage(
          category, page, size, query
        );
      } else {
        return this.productService.getProducts(page, size, query);
      }
    },
  });

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
    this.searchSubject.next(query);
  }

  onCategoryChange(categoryId: number | null): void {
    if (this.selectedCategory() === categoryId) return;

    this.selectedCategory.set(categoryId);
    this.currentPage.set(1);
    this.updateUrlParams();
    this.triggerReload();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;

    this.currentPage.set(page);
    this.updateUrlParams({ page });
    this.triggerReload();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSortChange(option: string): void {
    // Type guard to ensure option is a valid SortOption
    if (!this.isValidSortOption(option)) return;

    if (this.currentSort() === option) return;
    this.currentSort.set(option);
  }

  // Type guard function to validate SortOption
  private isValidSortOption(option: string): option is SortOption {
    return ['relevancia', 'precio-asc', 'precio-desc', 'puntuacion'].includes(option);
  }

  toggleFilters(): void {
    this.showFilters.update(show => !show);
  }

  getCategoryName(categoryId: number): string {
    return this.categories()[categoryId] || 'Otra categoría';
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

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }
}
