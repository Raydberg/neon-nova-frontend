import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  stock?: number; // Nuevo: cantidad máxima de stock disponible
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
  @Output() quantityChange = new EventEmitter<{id: number, quantity: number, productId: number, maxStock?: number}>();
  @Output() removeItem = new EventEmitter<{id: number, productId: number}>();

  updateQuantity(newQuantity: number): void {
    if (newQuantity < 1) return;

    // Si hay stock definido, no permitimos superar ese límite
    if (this.item.stock !== undefined && newQuantity > this.item.stock) {
      // Podrías mostrar un mensaje aquí o simplemente limitar la cantidad
      newQuantity = this.item.stock;
    }

    this.quantityChange.emit({
      id: this.item.id,
      quantity: newQuantity,
      productId: this.item.productId,
      maxStock: this.item.stock
    });
  }

  remove(): void {
    this.removeItem.emit({id: this.item.id, productId: this.item.productId});
  }

  // Método para formatear el precio
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  // Método para verificar si se ha alcanzado el stock máximo
  isMaxStock(): boolean {
    return this.item.stock !== undefined && this.item.quantity >= this.item.stock;
  }
}
