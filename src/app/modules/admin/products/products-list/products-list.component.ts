import {ChangeDetectionStrategy, Component, OnInit, inject, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {Products} from '@app/core/interfaces/product-client.interface';
import {rxResource} from '@angular/core/rxjs-interop';
import {AdminProductService} from '@app/core/services/admin/admin-product.service';
import {CategoryResponse} from '@core/interfaces/category-response.interface';
import {CategoryService} from '@core/services/category.service';

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'admin-products-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './products-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent implements OnInit {
  private productService = inject(AdminProductService);
  private categoryService = inject(CategoryService)

  sortColumn = signal<string>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  pageSize = signal(10);
  showDeleteModal = signal(false);
  productToDelete = signal<Products | null>(null);

  // Filter controls
  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  statusControl = new FormControl('');
  categories = signal<CategoryResponse[]>([]);

  // Categories (normally would come from a service)
  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  // Product resource with server-side pagination
  productsResource = rxResource({
    request: () => ({
      searchQuery: this.searchControl.value || '',
      page: this.currentPage(),
      pageSize: this.pageSize(),
      categoryId: this.categoryControl.value ? parseInt(this.categoryControl.value) : null,
      status: this.statusControl.value || null
    }),
    loader: ({request}) => {
      // Loguear para depurar
      console.log('Loading products with filters:', request);

      return this.productService.getAdminProducts(
        request.page,
        request.pageSize,
        request.searchQuery,
        request.categoryId,
        request.status
      );
    }
  });

  // Computed values
  isLoading = computed(() => this.productsResource.isLoading());

  error = computed(() => {
    const err = this.productsResource.error();
    if (!err) return null;

    // Handle different error types appropriately
    if (typeof err === 'string') {
      return err;
    } else if (err instanceof Error) {
      return err.message;
    } else if (typeof err === 'object' && err !== null && 'message' in err) {
      return (err as any).message;
    } else {
      return 'Error desconocido al cargar los productos';
    }
  });

  products = computed(() => this.productsResource.value()?.items || []);
  totalItems = computed(() => this.productsResource.value()?.totalItems || 0);
  totalPages = computed(() => this.productsResource.value()?.totalPages || 1);

  startIndex = computed(() => ((this.currentPage() - 1) * this.pageSize()) + 1);
  endIndex = computed(() => Math.min(this.startIndex() + this.products().length - 1, this.totalItems()));

  // Generate page numbers for pagination
  pagesArray = computed(() => {
    const totalPagesCount = this.totalPages();
    if (totalPagesCount <= 5) {
      return Array.from({length: totalPagesCount}, (_, i) => i + 1);
    }

    const currentPageVal = this.currentPage();
    if (currentPageVal <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPageVal >= totalPagesCount - 2) {
      return Array.from(
        {length: 5},
        (_, i) => totalPagesCount - 4 + i
      );
    }

    return [
      currentPageVal - 2,
      currentPageVal - 1,
      currentPageVal,
      currentPageVal + 1,
      currentPageVal + 2
    ];
  });

  // Apply sorting directly on the current page of results
  sortedProducts = computed(() => {
    let result = [...this.products()];

    // Apply sorting
    return result.sort((a, b) => {
      const column = this.sortColumn();
      const direction = this.sortDirection();

      if (column === 'name') {
        return direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (column === 'price') {
        return direction === 'asc'
          ? a.price - b.price
          : b.price - a.price;
      }

      return 0;
    });
  });

  ngOnInit() {
    this.loadCategories()
    // Subscribe to filter changes
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      // Reset to first page when filters change
      this.currentPage.set(1);
      this.productsResource.reload();
    });

    this.categoryControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.productsResource.reload();
    });

    this.statusControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.productsResource.reload();
    });
  }

  sortBy(column: string) {
    if (this.sortColumn() === column) {
      // Toggle direction if same column
      this.sortDirection.update(current =>
        current === 'asc' ? 'desc' : 'asc'
      );
    } else {
      // Set new column and default to ascending
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.productsResource.reload();
    }
  }

  resetFilters() {
    this.searchControl.setValue('');
    this.categoryControl.setValue('');
    this.statusControl.setValue('');
    this.sortColumn.set('name');
    this.sortDirection.set('asc');
    this.currentPage.set(1);
    this.productsResource.reload();
  }

  confirmDelete(product: Products) {
    this.productToDelete.set(product);
    this.showDeleteModal.set(true);
  }

  deleteProduct() {
    const productId = this.productToDelete()?.id;
    if (productId) {
      // Call the service to delete the product
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          // Close modal
          this.showDeleteModal.set(false);
          this.productToDelete.set(null);

          // Reload data
          this.productsResource.reload();
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          // Close modal but show error in UI (you could add a toast notification here)
          this.showDeleteModal.set(false);
          this.productToDelete.set(null);
        }
      });
    }
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  getCategoryName(categoryId?: number): string {
    if (!categoryId) return 'Sin categoría';
    const category = this.categories().find(c => c.id === categoryId);
    return category ? category.name : 'Desconocida';
  }

  getProductStatus(product: Products): string {
    if (product.status === 0) return 'Inactivo';
    if (product.stock === 0) return 'Sin stock';
    return 'Activo';
  }

  getStatusBadgeClass(product: Products): string {
    if (product.status === 0) return 'badge-warning';
    if (product.stock === 0) return 'badge-error';
    return 'badge-success';
  }

  parseInt(value: string): number {
    return parseInt(value);
  }

  getStatusLabel(statusValue: string): string {
    switch (statusValue) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'outOfStock':
        return 'Sin Stock';
      default:
        return 'Desconocido';
    }

  }
}
