import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { Products, ProductResponseClient } from '@app/core/interfaces/product-client.interface';
import { AdminProductService } from '@app/core/services/admin/admin-product.service';
import { CategoryResponse } from '@core/interfaces/category-response.interface';
import { CategoryService } from '@core/services/category.service';
import { CurrencyPENPipe } from '@shared/pipes/currency-pen.pipe';
import { ReportService } from '@core/services/report.service';

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
    LucideAngularModule, CurrencyPENPipe
  ],
  templateUrl: './products-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsListComponent implements OnInit {
  private productService = inject(AdminProductService);
  private categoryService = inject(CategoryService);
  // Inyecta el ReportService
  private reportService = inject(ReportService);

  // Estado para la generación del reporte
  isGeneratingReport = signal(false);
  // Estado de ordenamiento y paginación
  sortColumn = signal<string>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  pageSize = signal(10);

  // Estado modal de eliminación
  showDeleteModal = signal(false);
  productToDelete = signal<Products | null>(null);

  // Estado de carga y datos
  isLoading = signal(false);
  error = signal<string | null>(null);
  productsData = signal<ProductResponseClient | null>(null);

  // Controles de filtro
  searchControl = new FormControl('');
  categoryControl = new FormControl(null);
  statusControl = new FormControl(null);
  categories = signal<CategoryResponse[]>([]);

  // Datos calculados
  products = computed(() => this.productsData()?.items || []);
  totalItems = computed(() => this.productsData()?.totalItems || 0);
  totalPages = computed(() => this.productsData()?.totalPages || 1);

  startIndex = computed(() => ((this.currentPage() - 1) * this.pageSize()) + 1);
  endIndex = computed(() => Math.min(this.startIndex() + this.products().length - 1, this.totalItems()));

  // Generar números de página para la paginación
  pagesArray = computed(() => {
    const totalPagesCount = this.totalPages();
    if (totalPagesCount <= 5) {
      return Array.from({ length: totalPagesCount }, (_, i) => i + 1);
    }

    const currentPageVal = this.currentPage();
    if (currentPageVal <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPageVal >= totalPagesCount - 2) {
      return Array.from(
        { length: 5 },
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

  // Aplicar ordenamiento directamente en la página actual de resultados
  sortedProducts = computed(() => {
    let result = [...this.products()];

    // Aplicar ordenamiento
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

  constructor() {
    effect(() => {
      this.loadProducts();
    });
  }

  ngOnInit() {
    // Cargar categorías primero
    this.loadCategories();

    // Configurar escuchas para cambios en los filtros con un poco de retardo
    this.categoryControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.loadProducts();
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadProducts();
    });

    this.statusControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.loadProducts();
    });
  }
  // Método para descargar el reporte
  downloadProductReport(): void {
    this.isGeneratingReport.set(true);

    this.reportService.generateProductReport()
      .pipe(finalize(() => this.isGeneratingReport.set(false)))
      .subscribe({
        next: (blob: Blob) => {
          // Crear URL del objeto blob
          const url = window.URL.createObjectURL(blob);

          // Crear enlace para descarga
          const link = document.createElement('a');
          link.href = url;

          // Nombre del archivo con la fecha actual
          const date = new Date().toISOString().split('T')[0];
          link.download = `reporte-productos-${date}.pdf`;

          // Simular clic para descargar
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Liberar URL
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Error al generar el reporte de productos:', err);
          this.error.set('No se pudo descargar el reporte. Intente nuevamente.');
        }
      });
  }
  // Método para cargar categorías
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

  // Método principal para cargar productos
  loadProducts() {
    // Obtener los valores del formulario y convertirlos adecuadamente
    const searchQueryValue = this.searchControl.value?.trim() || '';

    // Asegurar que categoryId sea un número o null, nunca una cadena vacía
    let categoryIdValue: number | null = null;
    const categoryControlValue = this.categoryControl.value;

    if (categoryControlValue !== null && categoryControlValue !== '') {
      const parsedCategoryId = Number(categoryControlValue);
      categoryIdValue = !isNaN(parsedCategoryId) ? parsedCategoryId : null;
    }

    const statusValue = this.statusControl.value || null;
    const pageNumber = this.currentPage();
    const pageSize = this.pageSize();


    // Indicar que estamos cargando
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getAdminProducts(
      pageNumber,
      pageSize,
      searchQueryValue,
      categoryIdValue,
      statusValue
    )
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.productsData.set(response);
        },
        error: (err) => {
          console.error('Error al cargar productos:', err);
          if (typeof err === 'string') {
            this.error.set(err);
          } else if (err instanceof Error) {
            this.error.set(err.message);
          } else if (typeof err === 'object' && err !== null && 'message' in err) {
            this.error.set((err as any).message);
          } else {
            this.error.set('Error desconocido al cargar los productos');
          }
        }
      });
  }

  // Método para ordenar productos
  sortBy(column: string) {
    if (this.sortColumn() === column) {
      // Alternar dirección si es la misma columna
      this.sortDirection.update(current =>
        current === 'asc' ? 'desc' : 'asc'
      );
    } else {
      // Establecer nueva columna y por defecto ascendente
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  // Método para ir a una página específica
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      // El efecto se encargará de recargar los productos
    }
  }

  // Método para resetear todos los filtros
  resetFilters() {
    this.searchControl.setValue('');
    this.categoryControl.setValue(null);
    this.statusControl.setValue(null);
    this.sortColumn.set('name');
    this.sortDirection.set('asc');
    this.currentPage.set(1);
    // Recargar los productos
    this.loadProducts();
  }

  // Método para confirmar la eliminación de un producto
  confirmDelete(product: Products) {
    this.productToDelete.set(product);
    this.showDeleteModal.set(true);
  }

  // Método para eliminar un producto
  deleteProduct() {
    const productId = this.productToDelete()?.id;
    if (productId) {
      this.isLoading.set(true);

      // Llamar al servicio para eliminar el producto
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          // Cerrar modal
          this.showDeleteModal.set(false);
          this.productToDelete.set(null);

          // Recargar los datos
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error al eliminar producto:', err);
          // Cerrar modal pero mostrar error en la UI
          this.showDeleteModal.set(false);
          this.productToDelete.set(null);
          this.error.set('Error al eliminar el producto. Inténtelo de nuevo más tarde.');
          this.isLoading.set(false);
        }
      });
    }
  }

  getCategoryName(categoryId?: string | number): string {
    if (!categoryId) return 'Sin categoría';

    // Asegurar que categoryId es un número
    const catId = Number(categoryId);
    if (isNaN(catId)) return 'Sin categoría';

    const category = this.categories().find(c => c.id === catId);
    return category ? category.name : 'Desconocida';
  }
  getProductStatus(product: Products): string {
    // Primero verificar el status oficial del backend
    if (product.status === 3) return 'Sin Stock';
    if (product.status === 2) return 'Inactivo';

    // Si tiene status 1 (Activo) pero stock es 0, mostrar como "Sin Stock"
    if (product.stock === 0) return 'Sin Stock';

    // Por defecto (status === 1 y stock > 0) es "Activo"
    return 'Activo';
  }

  getStatusBadgeClass(product: Products): string {
    // Primero verificar el status oficial del backend
    if (product.status === 3) return 'badge-error';  // Sin Stock
    if (product.status === 2) return 'badge-warning'; // Inactivo

    // Si tiene status 1 (Activo) pero stock es 0, mostrar como "Sin Stock"
    if (product.stock === 0) return 'badge-error';

    // Por defecto (status === 1 y stock > 0) es "Activo"
    return 'badge-success';
  }

  parseInt(value: string | null): number {
    if (!value) return 0;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  getStatusLabel(statusValue: string): string {
    switch (statusValue) {
      case 'Active':
        return 'Activo';
      case 'Inactive':
        return 'Inactivo';
      case 'OutOfStock':
        return 'Sin Stock';
      default:
        return 'Desconocido';
    }
  }
}
