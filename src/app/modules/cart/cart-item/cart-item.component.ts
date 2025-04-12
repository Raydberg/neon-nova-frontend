import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Trash2, Plus, Minus } from 'lucide-angular';

export interface CartItem {
  id: number;
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

@Component({
  selector: 'cart-item',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './cart-item.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    :host {
      display: block;
      animation: fadeIn 0.3s ease-out forwards;
    }

    .item-container {
      transition: all 0.2s ease-out;
    }

    .item-container:hover {
      background-color: rgba(var(--base-200), 0.05);
    }

    .quantity-btn {
      transition: transform 0.15s ease;
    }

    .quantity-btn:hover:not(:disabled) {
      transform: scale(1.15);
    }

    .remove-btn {
      transition: all 0.2s ease;
    }

    .remove-btn:hover {
      background-color: rgba(var(--er), 0.1);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemComponent {
  @Input() item!: CartItem;
  @Output() quantityChange = new EventEmitter<{id: number, quantity: number}>();
  @Output() removeItem = new EventEmitter<number>();

  // Iconos
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;

  updateQuantity(newQuantity: number): void {
    if (newQuantity < 1) return;
    this.quantityChange.emit({id: this.item.id, quantity: newQuantity});
  }

  remove(): void {
    this.removeItem.emit(this.item.id);
  }

  // Método para formatear el precio
  formatPrice(price: number): string {
    return price.toFixed(2);
  }
}
