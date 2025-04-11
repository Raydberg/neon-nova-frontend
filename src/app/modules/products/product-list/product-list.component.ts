import { ChangeDetectionStrategy, Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { LucideAngularModule, Search, SlidersHorizontal, FilterIcon, ChevronDownIcon } from 'lucide-angular';
import { ProductCardComponent, Product } from '@shared/components/product-card/product-card.component';
import { ProductSearchComponent } from '../product-search/product-search.component';

type SortOption = 'relevancia' | 'precio-asc' | 'precio-desc' | 'puntuacion';

@Component({
  selector: 'product-list',
  standalone: true,
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

  ngOnInit() {
    // Carga inicial de productos
    this.loadProducts();

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

  // Cargar datos
  private loadProducts() {
    this.isLoading.set(true);

    // Simulación de carga de datos
    setTimeout(() => {
      this.allProducts.set([
        {
          id: 1,
          nombre: "Laptop Pro X",
          descripcion: "Potente laptop con procesador de última generación",
          precio: 1299.99,
          imagen: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80",
          categoria_id: 1,
          puntuacion: 4.5,
        },
        {
          id: 2,
          nombre: "Smartphone Galaxy Ultra",
          descripcion: "Smartphone con cámara profesional y batería de larga duración",
          precio: 899.99,
          imagen: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1227&q=80",
          categoria_id: 2,
          puntuacion: 4.8,
        },
        {
          id: 3,
          nombre: "Auriculares Noise Cancel",
          descripcion: "Auriculares con cancelación de ruido y sonido premium",
          precio: 249.99,
          imagen: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1165&q=80",
          categoria_id: 3,
          puntuacion: 4.7,
        },
        {
          id: 4,
          nombre: "Smartwatch Fitness Pro",
          descripcion: "Reloj inteligente con monitoreo de salud y GPS integrado",
          precio: 199.99,
          imagen: "https://images.unsplash.com/photo-1617043786395-f977fa12eddf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          categoria_id: 4,
          puntuacion: 4.3,
        },
        {
          id: 5,
          nombre: "Cámara DSLR 4K",
          descripcion: "Cámara profesional con grabación en 4K y lentes intercambiables",
          precio: 1499.99,
          imagen: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1164&q=80",
          categoria_id: 5,
          puntuacion: 4.6,
        },
        {
          id: 6,
          nombre: "Consola GameStation 5",
          descripcion: "La última consola con gráficos 8K y SSD ultrarrápido",
          precio: 499.99,
          imagen: "https://images.unsplash.com/photo-1606318801954-d46d46d3360a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          categoria_id: 7,
          puntuacion: 4.9,
        },
        {
          id: 7,
          nombre: "Tablet Pro 12",
          descripcion: "Tablet de 12 pulgadas con pantalla retina y lápiz incluido",
          precio: 649.99,
          imagen: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1631&q=80",
          categoria_id: 1,
          puntuacion: 4.4,
        },
        {
          id: 8,
          nombre: "Monitor Curvo 32\"",
          descripcion: "Monitor gaming curvo de 32 pulgadas con alta tasa de refresco",
          precio: 349.99,
          imagen: "https://images.unsplash.com/photo-1555626906-fcf10d6851b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          categoria_id: 1,
          puntuacion: 4.5,
        }
      ]);
      this.isLoading.set(false);
    }, 800);
  }
}
