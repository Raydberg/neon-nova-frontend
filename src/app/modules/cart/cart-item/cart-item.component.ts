import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CurrencyPENPipe } from '@shared/pipes/currency-pen.pipe';

export interface CartItemEvent {
  id: number;
  quantity: number;
  productId: number;
  maxStock?: number;
  action?: 'increment' | 'decrement';
}
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  stock?: number; // Opcional: cantidad máxima de stock disponible
}
@Component({
  selector: 'cart-item',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, CurrencyPENPipe],
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

    .updating {
      opacity: 0.7;
      pointer-events: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemComponent {
  @Input() item!: CartItem;
  @Input() isUpdating = false;
  // @Output() quantityChange = new EventEmitter<{id: number, quantity: number, productId: number, maxStock?: number}>();
  @Output() removeItem = new EventEmitter<{id: number, productId: number}>();
  @Output() quantityChange = new EventEmitter<CartItemEvent>();
  // updateQuantity(newQuantity: number): void {
  //   if (newQuantity < 1) return;
  //   if (this.isUpdating) return; // No permitir cambios mientras se actualiza

  //   // Si hay stock definido, no permitimos superar ese límite
  //   if (this.item.stock !== undefined && newQuantity > this.item.stock) {
  //     // Podrías mostrar un mensaje aquí o simplemente limitar la cantidad
  //     newQuantity = this.item.stock;
  //   }

  //   this.quantityChange.emit({
  //     id: this.item.id,
  //     quantity: newQuantity,
  //     productId: this.item.productId,
  //     maxStock: this.item.stock
  //   });
  // }
  incrementQuantity(): void {
    if (this.isUpdating) return; // No permitir cambios mientras se actualiza

    // Si hay stock definido, no permitimos superar ese límite
    if (this.item.stock !== undefined && this.item.quantity >= this.item.stock) {
      return; // No incrementar si ya alcanzó el stock máximo
    }

    this.quantityChange.emit({
      id: this.item.id,
      quantity: this.item.quantity + 1,
      productId: this.item.productId,
      maxStock: this.item.stock,
      action: 'increment'
    });
  }

  decrementQuantity(): void {
    if (this.isUpdating) return; // No permitir cambios mientras se actualiza
    if (this.item.quantity <= 1) return; // No decrementar por debajo de 1

    this.quantityChange.emit({
      id: this.item.id,
      quantity: this.item.quantity - 1,
      productId: this.item.productId,
      maxStock: this.item.stock,
      action: 'decrement'
    });
  }
  remove(): void {
    if (this.isUpdating) return; // No permitir eliminar mientras se actualiza
    this.removeItem.emit({id: this.item.id, productId: this.item.productId});
  }
  hasReachedMaxStock(): boolean {
    const stockLimit = this.item.stock;
    const currentQuantity = this.item.quantity;

    // Añadimos un log más detallado para entender el problema
    console.log(`Stock check for ${this.item.productName}:`, {
      stockLimit,
      currentQuantity,
      isStockDefined: stockLimit !== undefined,
      isStockPositive: stockLimit !== undefined && stockLimit > 0,
      hasReachedLimit: stockLimit !== undefined && stockLimit > 0 && currentQuantity >= stockLimit
    });

    // Si no hay límite de stock definido o es 0 o negativo, nunca se alcanza el máximo
    if (stockLimit === undefined || stockLimit <= 0) {
      return false;
    }

    // Verdadero si la cantidad actual es igual o mayor al límite de stock
    return currentQuantity >= stockLimit;
  }
  // isMaxStock(): boolean {
  //   Solo retornamos true si stock está definido y la cantidad actual lo alcanza o supera
  //   return this.item.stock !== undefined &&
  //          this.item.stock > 0 &&
  //          this.item.quantity >= this.item.stock;
  // }
}
