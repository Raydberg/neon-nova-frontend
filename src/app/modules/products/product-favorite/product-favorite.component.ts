import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { Products } from '@app/core/interfaces/product-client.interface';

interface FavoriteProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  addedAt: string;
  categoryName?: string;
  punctuation?: number;
}

@Component({
  selector: 'product-favorite',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ProductCardComponent
  ],
  templateUrl: './product-favorite.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .favorite-item {
      animation: fadeIn 0.5s ease-out forwards;
    }

    .favorite-item:nth-child(1) { animation-delay: 0.05s; }
    .favorite-item:nth-child(2) { animation-delay: 0.1s; }
    .favorite-item:nth-child(3) { animation-delay: 0.15s; }
    .favorite-item:nth-child(4) { animation-delay: 0.2s; }

    .empty-favorites {
      animation: fadeIn 0.5s ease-out forwards;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .btn-remove-all:hover {
      animation: pulse 0.8s infinite;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFavoriteComponent implements OnInit {
  // Estado de favoritos - cambiamos a Products en lugar de Partial<Products>
  favoriteProducts = signal<Products[]>([]);
  isLoading = signal(true);

  // Valores calculados
  hasFavorites = computed(() => this.favoriteProducts().length > 0);

  ngOnInit() {
    // Cargar favoritos desde localStorage
    setTimeout(() => {
      this.loadFavorites();
      this.isLoading.set(false);
    }, 300);
  }

  loadFavorites() {
    const storedFavorites = localStorage.getItem('favorites');
    const favorites: FavoriteProduct[] = storedFavorites ? JSON.parse(storedFavorites) : [];

    // Convertir los datos del localStorage al formato que espera el ProductCardComponent
    // y asegurándonos de que sea del tipo Products completo
    this.favoriteProducts.set(favorites.map(fav => ({
      id: fav.id,
      name: fav.name,
      price: fav.price,
      imageUrl: fav.imageUrl || '', // Asegurar que no sea undefined
      punctuation: fav.punctuation || 0,
      categoryName: fav.categoryName || 'Producto',
      categoryId: 0, // Valor por defecto para la propiedad requerida
      status: 1,     // Si también es requerida en Products
      stock: 0,      // Si también es requerida en Products
      firstImage: {  // Si es necesario para Products
        id: 0,
        imageUrl: fav.imageUrl || '',
        createdAt: new Date()
      }
    }) as Products)); // Hacer type casting explícito a Products
  }

  removeFromFavorites(productId: number) {
    // Eliminar del state local
    this.favoriteProducts.update(favs => favs.filter(p => p.id !== productId));

    // Eliminar de localStorage
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      const favorites: FavoriteProduct[] = JSON.parse(storedFavorites);
      const updatedFavorites = favorites.filter(fav => fav.id !== productId);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
  }

  clearAllFavorites() {
    // Limpiar estado local
    this.favoriteProducts.set([]);

    // Limpiar localStorage
    localStorage.setItem('favorites', JSON.stringify([]));
  }

  addAllToCart() {
    // Implementación de la funcionalidad para añadir todos al carrito
    console.log('Todos los productos añadidos al carrito');
    // Aquí integrarías con tu servicio de carrito
  }
}
