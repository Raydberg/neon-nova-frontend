import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'cart-summary',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,RouterLink],
  templateUrl: './cart-summary.component.html',
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    :host {
      display: block;
      animation: slideIn 0.4s ease-out forwards;
    }

    .discount-badge {
      transition: all 0.3s ease;
    }

    .apply-btn {
      transition: transform 0.2s ease;
    }

    .apply-btn:hover {
      transform: translateX(3px);
    }

    .checkout-btn {
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .checkout-btn::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transform: translateX(-100%);
    }

    .checkout-btn:hover::after {
      transform: translateX(100%);
      transition: transform 0.8s ease;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSummaryComponent {
  @Input() subtotal: number = 0;
  @Input() hasDiscount: boolean = false;
  @Input() discountValue: number = 0;

  discountCode: string = '';

  get shipping(): number {
    // Envío gratuito para compras mayores a $1000
    return this.subtotal > 1000 ? 0 : 9.99;
  }

  get total(): number {
    let total = this.subtotal + this.shipping;
    if (this.hasDiscount) {
      total -= this.discountValue;
    }
    return total;
  }

  // Método para formatear el precio
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  applyDiscount(): void {
    // Esta función se implementaría con un servicio para validar y aplicar descuentos
    console.log('Aplicando descuento:', this.discountCode);
    // Simulación de llamada al servicio
  }
}
