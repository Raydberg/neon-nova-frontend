import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ProductResponseClient, Products } from '@app/core/interfaces/product-client.interface';

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria_id?: number;
  stock?: number;
  activo?: boolean;
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
  @Input() product!: Products;
  formatPrice(price: number): string {
    return price.toFixed(2);
  }
}
