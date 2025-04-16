import { ChangeDetectionStrategy, Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, of, Subject } from 'rxjs';

import { LucideAngularModule, Search, SlidersHorizontal, FilterIcon, ChevronDownIcon } from 'lucide-angular';
import { ProductCardComponent, Product } from '@shared/components/product-card/product-card.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductService } from '@app/core/services/product.service';

type SortOption = 'relevancia' | 'precio-asc' | 'precio-desc' | 'puntuacion';

@Component({
  selector: 'product-list',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ProductCardComponent,
    // ProductSearchComponent
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
export class ProductListComponent implements OnInit {
  ngOnInit() {
    // Carga inicial de productos
    // this.loadProducts();
    // console.log(this.productService.getProducts().subscribe(product => console.log(product)))

    // Configurar observador de búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
    });

    // Verificar si hay parámetros de consulta
    this.route.queryParams.subscribe(params => {
      if (params['categoria']) {
        this.selectedCategory.set(Number(params['categoria']));
      }

      if (params['buscar']) {
        this.searchQuery.set(params['buscar']);
      }
    });
  }
  private productService = inject(ProductService)

  loadProducts = rxResource({

    loader: () => {
      // console.info("Obteniendo request", request)
      // if (!request) return of([])
      return this.productService.getProducts()
    }
  })
  // Iconos
  readonly SearchIcon = Search;
  readonly FilterIcon = FilterIcon;
  readonly SlidersIcon = SlidersHorizontal;
  readonly ChevronDownIcon = ChevronDownIcon;

  // Datos reactivos
  allProducts = signal<Product[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  selectedCategory = signal<number | null>(null);
  currentSort = signal<SortOption>('relevancia');
  showFilters = signal(false);

  // Observables para manejar la búsqueda con debounce
  private searchSubject = new Subject<string>();

  // Inyecciones
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Productos filtrados como valor calculado
  filteredProducts = computed(() => {
    let result = this.allProducts();
    const search = this.searchQuery().toLowerCase().trim();

    // Aplicar filtro de búsqueda
    if (search) {
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(search) ||
        p.descripcion.toLowerCase().includes(search)
      );
    }

    // Aplicar filtro de categoría
    if (this.selectedCategory()) {
      result = result.filter(p => p.categoria_id === this.selectedCategory());
    }

    // Aplicar ordenamiento
    switch (this.currentSort()) {
      case 'precio-asc':
        return result.slice().sort((a, b) => a.precio - b.precio);
      case 'precio-desc':
        return result.slice().sort((a, b) => b.precio - a.precio);
      case 'puntuacion':
        return result.slice().sort((a, b) => (b.puntuacion || 0) - (a.puntuacion || 0));
      default:
        return result; // relevancia (mantiene orden original)
    }
  });



  // Métodos para UI
  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  onCategoryChange(categoryId: number | null) {
    this.selectedCategory.set(categoryId);

    // Actualiza la URL con el parámetro de categoría
    const queryParams: any = {};
    if (categoryId !== null) {
      queryParams.categoria = categoryId;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  onSortChange(option: SortOption) {
    this.currentSort.set(option);
  }

  toggleFilters() {
    this.showFilters.update(show => !show);
  }


}
