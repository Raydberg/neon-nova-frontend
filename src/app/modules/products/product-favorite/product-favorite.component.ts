import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ProductCardComponent, Product } from '@shared/components/product-card/product-card.component';

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
  // Iconos

  // Estado de favoritos
  favoriteProducts = signal<Product[]>([]);
  isLoading = signal(true);

  // Valores calculados
  hasFavorites = computed(() => this.favoriteProducts().length > 0);

  ngOnInit() {
    // Simulación de carga de favoritos desde localStorage o un servicio
    setTimeout(() => {
      this.loadFavorites();
      this.isLoading.set(false);
    }, 800);
  }

  loadFavorites() {
    // Aquí cargarías los favoritos desde un servicio o localStorage
    // Por ahora uso datos de ejemplo
    this.favoriteProducts.set([
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
      }
    ]);
  }

  removeFromFavorites(productId: number) {
    this.favoriteProducts.update(favs => favs.filter(p => p.id !== productId));
  }

  clearAllFavorites() {
    this.favoriteProducts.set([]);
  }

  addAllToCart() {
    // Implementación de la funcionalidad para añadir todos al carrito
    console.log('Todos los productos añadidos al carrito');
    // Aquí integrarías con tu servicio de carrito
  }
}
