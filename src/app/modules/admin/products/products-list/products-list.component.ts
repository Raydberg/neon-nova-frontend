import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  PlusIcon, FilterIcon, SearchIcon, ChevronUpIcon, ChevronDownIcon,
  EditIcon, TrashIcon, PackageIcon, RefreshCwIcon, ChevronLeftIcon,
  ChevronRightIcon, AlertTriangleIcon
} from 'lucide-angular';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Product } from '../../../../shared/components/product-card/product-card.component';

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
  // Icons
  readonly PlusIcon = PlusIcon;
  readonly FilterIcon = FilterIcon;
  readonly SearchIcon = SearchIcon;
  readonly ChevronUpIcon = ChevronUpIcon;
  readonly ChevronDownIcon = ChevronDownIcon;
  readonly EditIcon = EditIcon;
  readonly TrashIcon = TrashIcon;
  readonly PackageIcon = PackageIcon;
  readonly RefreshCwIcon = RefreshCwIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly AlertTriangleIcon = AlertTriangleIcon;

  // State signals
  products = signal<Product[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  sortColumn = signal<string>('nombre');
  sortDirection = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  pageSize = signal(10);
  showDeleteModal = signal(false);
  productToDelete = signal<Product | null>(null);

  // Filter controls
  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  statusControl = new FormControl('');

  // Categories (normally would come from a service)
  categories = signal<Category[]>([
    { id: 1, name: 'Laptops' },
    { id: 2, name: 'Smartphones' },
    { id: 3, name: 'Audio' },
    { id: 4, name: 'Wearables' },
    { id: 5, name: 'Cámaras' },
    { id: 6, name: 'Televisores' },
    { id: 7, name: 'Gaming' },
    { id: 8, name: 'Impresoras' }
  ]);

  // Computed values
  filteredProducts = computed(() => {
    let result = this.products();

    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      result = result.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm) ||
        product.descripcion.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    const categoryId = this.categoryControl.value;
    if (categoryId) {
      result = result.filter(product => product.categoria_id === Number(categoryId));
    }

    // Apply status filter
    const status = this.statusControl.value;
    if (status) {
      if (status === 'outOfStock') {
        result = result.filter(product => product.stock === 0);
      } else if (status === 'active') {
        result = result.filter(product => product.activo && product.stock! > 0);
      } else if (status === 'inactive') {
        result = result.filter(product => !product.activo);
      }
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      const column = this.sortColumn();
      const direction = this.sortDirection();

      if (column === 'nombre') {
        return direction === 'asc'
          ? a.nombre.localeCompare(b.nombre)
          : b.nombre.localeCompare(a.nombre);
      } else if (column === 'precio') {
        return direction === 'asc'
          ? a.precio - b.precio
          : b.precio - a.precio;
      }

      return 0;
    });

    return result;
  });

  // Pagination computed values
  totalProducts = computed(() => this.filteredProducts().length);

  totalPages = computed(() =>
    Math.ceil(this.totalProducts() / this.pageSize())
  );

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

  startIndex = computed(() =>
    (this.currentPage() - 1) * this.pageSize()
  );

  endIndex = computed(() =>
    Math.min(
      this.startIndex() + this.pageSize(),
      this.totalProducts()
    )
  );

  paginatedProducts = computed(() => {
    const start = this.startIndex();
    const end = this.endIndex();
    return this.filteredProducts().slice(start, end);
  });

  ngOnInit() {
    // Load products
    this.loadProducts();

    // Subscribe to filter changes
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      // Reset to first page when filters change
      this.currentPage.set(1);
    });

    this.categoryControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
    });

    this.statusControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
    });
  }

  loadProducts() {
    this.isLoading.set(true);
    this.error.set(null);

    // Simulando carga de datos con datos de muestra
    // En una aplicación real, llamarías a un servicio
    setTimeout(() => {
      this.products.set(this.getSampleProducts());
      this.isLoading.set(false);
    }, 800);
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
    }
  }

  resetFilters() {
    this.searchControl.setValue('');
    this.categoryControl.setValue('');
    this.statusControl.setValue('');
    this.sortColumn.set('nombre');
    this.sortDirection.set('asc');
    this.currentPage.set(1);
  }

  confirmDelete(product: Product) {
    this.productToDelete.set(product);
    this.showDeleteModal.set(true);
  }

  deleteProduct() {
    // Implementación para eliminar un producto
    const productId = this.productToDelete()?.id;
    if (productId) {
      // Llamada a servicio para eliminar el producto (simulando)
      this.products.update(products =>
        products.filter(p => p.id !== productId)
      );

      // Cerrar modal
      this.showDeleteModal.set(false);
      this.productToDelete.set(null);

      // Si la página actual queda vacía, volver a la anterior
      if (this.paginatedProducts().length === 0 && this.currentPage() > 1) {
        this.currentPage.update(page => page - 1);
      }
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

  getProductStatus(product: any): string {
    if (!product.activo) return 'Inactivo';
    if (product.stock === 0) return 'Sin stock';
    return 'Activo';
  }

  getStatusBadgeClass(product: any): string {
    if (!product.activo) return 'badge-warning';
    if (product.stock === 0) return 'badge-error';
    return 'badge-success';
  }

  // Sample data for demonstration
  private getSampleProducts(): Product[] {
    // Extended Product interface with additional properties for the admin view
    return [
      {
        id: 1,
        nombre: "Laptop Pro X",
        descripcion: "Potente laptop con procesador de última generación",
        precio: 1299.99,
        imagen: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80",
        categoria_id: 1,
        puntuacion: 4.5,
        stock: 15,
        activo: true
      },
      {
        id: 2,
        nombre: "Smartphone Galaxy Ultra",
        descripcion: "Smartphone con cámara profesional y batería de larga duración",
        precio: 899.99,
        imagen: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1227&q=80",
        categoria_id: 2,
        puntuacion: 4.8,
        stock: 23,
        activo: true
      },
      // Add more sample products...
      {
        id: 3,
        nombre: "Auriculares Noise Cancel",
        descripcion: "Auriculares con cancelación de ruido y sonido premium",
        precio: 249.99,
        imagen: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1165&q=80",
        categoria_id: 3,
        puntuacion: 4.7,
        stock: 30,
        activo: true
      },
      {
        id: 4,
        nombre: "Smartwatch Fitness Pro",
        descripcion: "Reloj inteligente con monitoreo de salud y GPS integrado",
        precio: 199.99,
        imagen: "https://images.unsplash.com/photo-1617043786395-f977fa12eddf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        categoria_id: 4,
        puntuacion: 4.3,
        stock: 0,
        activo: true
      },
      {
        id: 5,
        nombre: "Cámara DSLR 4K",
        descripcion: "Cámara profesional con grabación en 4K y lentes intercambiables",
        precio: 1499.99,
        imagen: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1164&q=80",
        categoria_id: 5,
        puntuacion: 4.6,
        stock: 7,
        activo: true
      },
      {
        id: 6,
        nombre: "Smart TV 65'' OLED",
        descripcion: "Televisor con pantalla OLED, resolución 4K y sistema operativo inteligente",
        precio: 1299.99,
        imagen: "https://images.unsplash.com/photo-1601944177325-f8867652837f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        categoria_id: 6,
        puntuacion: 4.8,
        stock: 10,
        activo: true
      },
      {
        id: 7,
        nombre: "Consola GameStation 5",
        descripcion: "La última consola con gráficos 8K y SSD ultrarrápido",
        precio: 499.99,
        imagen: "https://images.unsplash.com/photo-1606318801954-d46d46d3360a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        categoria_id: 7,
        puntuacion: 4.9,
        stock: 3,
        activo: true
      },
      {
        id: 8,
        nombre: "Impresora Multifunción Láser",
        descripcion: "Impresora, escáner y fotocopiadora a color con conexión WiFi",
        precio: 299.99,
        imagen: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        categoria_id: 8,
        puntuacion: 4.2,
        stock: 12,
        activo: false
      },
      // Add more products as needed for testing pagination
    ];
  }
}
