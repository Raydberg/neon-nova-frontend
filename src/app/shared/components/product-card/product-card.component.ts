import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ShoppingCartIcon, StarIcon } from 'lucide-angular';

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria_id?: number;
  puntuacion?: number;
}

@Component({
  selector: 'product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() product!: Product;

  // Iconos
  readonly StarIcon = StarIcon;
  readonly ShoppingCartIcon = ShoppingCartIcon;

  // Método para formatear el precio
  formatPrice(price: number): string {
    return price.toFixed(2);
  }
}
