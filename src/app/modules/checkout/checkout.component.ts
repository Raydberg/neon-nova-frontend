import { ChangeDetectionStrategy, Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CartService } from '@app/core/services/cart.service';
import { CartShopClient, Detail } from '@app/core/models/cart-shop.model';
import { rxResource } from '@angular/core/rxjs-interop';
import {CurrencyPENPipe} from '@shared/pipes/currency-pen.pipe';

interface CartSummary {
  items: Detail[];
  total: number;
  subtotal: number;
  shipping: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,CurrencyPENPipe
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit {
  // Router para la navegación
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cartService = inject(CartService);

  // Estado para seguimiento de pasos
  currentStep = signal<'shipping' | 'payment' | 'confirmation'>('shipping');

  // Cart resource para cargar datos del carrito
  cartResource = rxResource({
    loader: () => this.cartService.getAllCartShop()
  });

  // Datos del carrito
  cartData = signal<CartSummary>({
    items: [],
    total: 0,
    subtotal: 0,
    shipping: 0
  });

  constructor() {
    // Utilizamos un efecto para actualizar los datos cuando cartResource cambie
    effect(() => {
      const result = this.cartResource.value();
      console.log('Checkout cart response:', result);

      // Verificamos si tenemos un objeto con la propiedad details
      if (result && result.details) {
        // Ya tenemos el carrito directamente
        const cart = result;
        const subtotal = cart.total;
        const shipping = subtotal > 1000 ? 0 : 9.99;

        // Actualizamos el estado local
        this.cartData.set({
          items: cart.details || [],
          subtotal: subtotal,
          shipping: shipping,
          total: subtotal + shipping
        });

        console.log('Checkout cart details:', cart.details);
      } else {
        console.log('Empty or invalid cart response in checkout:', result);
        this.cartData.set({
          items: [],
          total: 0,
          subtotal: 0,
          shipping: 0
        });
      }
    });
  }

  ngOnInit() {
    // Iniciamos la carga de datos del carrito
    this.cartResource.reload();

    // Detecta cambios en la URL para actualizar el paso actual
    this.route.url.subscribe(segments => {
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1].path;
        if (lastSegment === 'shipping' || lastSegment === 'payment' || lastSegment === 'confirmation') {
          this.currentStep.set(lastSegment as 'shipping' | 'payment' | 'confirmation');
        }
      }
    });
  }

  // Getter para los items del carrito
  get cartItems() {
    return this.cartData().items;
  }

  // Getter para el subtotal
  get subtotal(): number {
    return this.cartData().subtotal;
  }

  // Getter para el envío
  get shipping(): number {
    return this.cartData().shipping;
  }

  // Getter para el total
  get total(): number {
    return this.cartData().total;
  }


  goToShipping(): void {
    this.currentStep.set('shipping');
    this.router.navigate(['shipping'], { relativeTo: this.route });
  }

  goToPayment(): void {
    this.currentStep.set('payment');
    this.router.navigate(['payment'], { relativeTo: this.route });
  }

  goToConfirmation(): void {
    this.currentStep.set('confirmation');
    this.router.navigate(['confirmation'], { relativeTo: this.route });
  }
}
