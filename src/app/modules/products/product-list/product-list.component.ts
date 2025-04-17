import { ChangeDetectionStrategy, Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { LucideAngularModule } from 'lucide-angular';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductService } from '@app/core/services/product.service';
import { ProductResponseClient } from '@app/core/interfaces/product-client.interface';

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
export class ProductListComponent implements OnInit {
  // Inyecciones
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Resource para cargar productos
  loadProducts = rxResource({
    loader: () => this.productService.getProducts()
  });

  // Datos reactivos
  searchQuery = signal('');
  selectedCategory = signal<number | null>(null);
  currentSort = signal<SortOption>('relevancia');
  showFilters = signal(false);

  // Observables para manejar la búsqueda con debounce
  private searchSubject = new Subject<string>();

  // Productos filtrados como valor calculado
  filteredProducts = computed(() => {
    // Si loadProducts aún no tiene valor, retornar array vacío
    if (!this.loadProducts.value()) return [];

    let result = this.loadProducts.value() || [];
    const search = this.searchQuery().toLowerCase().trim();

    // Aplicar filtro de búsqueda
    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search)
      );
    }

    // Aplicar filtro de categoría
    if (this.selectedCategory()) {
      result = result.filter(p => p.categoryId === this.selectedCategory());
    }

    // Aplicar ordenamiento
    switch (this.currentSort()) {
      case 'precio-asc':
        return result.slice().sort((a, b) => a.price - b.price);
      case 'precio-desc':
        return result.slice().sort((a, b) => b.price - a.price);
      case 'puntuacion':
        return result.slice().sort((a, b) => (b.punctuation || 0) - (a.punctuation || 0));
      default:
        return result; // relevancia (mantiene orden original)
    }
  });

  ngOnInit() {
    this.productService.getProducts().subscribe(pro => console.log(pro))
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
    });

    this.route.queryParams.subscribe(params => {
      if (params['categoria']) {
        this.selectedCategory.set(Number(params['categoria']));
      }

      if (params['buscar']) {
        this.searchQuery.set(params['buscar']);
      }
    });
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  onCategoryChange(categoryId: number | null) {
    this.selectedCategory.set(categoryId);

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
}
