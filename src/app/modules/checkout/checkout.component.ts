import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, ArrowLeft, CreditCard, Landmark, Truck, Check, ChevronRightIcon } from 'lucide-angular';
import { CartItem } from '../cart/cart-item/cart-item.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl:'./checkout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent {
  // Iconos para usar en el template
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CreditCardIcon = CreditCard;
  readonly LandmarkIcon = Landmark;
  readonly TruckIcon = Truck;
  readonly CheckIcon = Check;
  readonly ChevronRightIcon = ChevronRightIcon;

  // Router para la navegación
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Estado para seguimiento de pasos
  currentStep = signal<'shipping' | 'payment' | 'confirmation'>('shipping');

  // Datos simulados del carrito
  cartItems = signal<CartItem[]>([
    {
      id: 1,
      producto_id: 1,
      nombre: "Laptop Pro X",
      precio: 1299.99,
      cantidad: 1,
      imagen: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
    },
    {
      id: 2,
      producto_id: 3,
      nombre: "Auriculares Noise Cancel",
      precio: 249.99,
      cantidad: 2,
      imagen: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
    }
  ]);

  // Cálculos para el resumen
  get subtotal(): number {
    return this.cartItems().reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  get shipping(): number {
    // Envío gratuito para compras mayores a $1000
    return this.subtotal > 1000 ? 0 : 9.99;
  }

  get total(): number {
    return this.subtotal + this.shipping;
  }

  // Método para formatear precio
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  // Métodos de navegación entre pasos
  constructor() {
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

  goToShipping(): void {
    this.currentStep.set('shipping');
    this.router.navigate(['shipping'], { relativeTo: this.route.parent });
  }

  goToPayment(): void {
    this.currentStep.set('payment');
    this.router.navigate(['payment'], { relativeTo: this.route.parent });
  }

  goToConfirmation(): void {
    this.currentStep.set('confirmation');
    this.router.navigate(['confirmation'], { relativeTo: this.route.parent });
  }
}
