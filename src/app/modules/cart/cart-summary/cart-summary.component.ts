import {ChangeDetectionStrategy, Component, input, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {CurrencyPENPipe} from '@shared/pipes/currency-pen.pipe';

@Component({
  selector: 'cart-summary',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,RouterLink,CurrencyPENPipe],
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
  subtotal = input<number>(0);
  total = input<number>(0);

}
