import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Truck } from 'lucide-angular';
import { CheckoutService } from '@app/core/services/checkout.service';
import { finalize } from 'rxjs';
import { CheckoutRequest } from '@app/core/interfaces/checkout-http.interface';
import {CurrencyPENPipe} from '@shared/pipes/currency-pen.pipe';

@Component({
  selector: 'checkout-shipping',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule, RouterLink,CurrencyPENPipe
  ],
  templateUrl: './shipping.component.html',
  styles: [`
  .form-section {
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .shipping-option {
    transition: all 0.2s ease-out;
  }

  .shipping-option:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .shipping-option.active {
    border-color: hsl(var(--p));
  }

  .shipping-icon {
    transition: transform 0.3s ease;
  }

  .shipping-option:hover .shipping-icon {
    transform: translateX(5px);
  }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private checkoutService = inject(CheckoutService);

  isSubmitting = signal<boolean>(false);

  shippingForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    shippingMethod: ['standard', [Validators.required]]
  });

  shippingMethods = [
    {
      id: 'standard',
      name: 'Envío estándar (3-5 días)',
      price: 9.99,
      icon: Truck
    },
    {
      id: 'express',
      name: 'Envío express (1-2 días)',
      price: 19.99,
      icon: Truck
    }
  ];

  continueToPayment(): void {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // Get the selected shipping method
    const selectedMethod = this.shippingMethods.find(
      method => method.id === this.shippingForm.get('shippingMethod')?.value
    );

    // Format the data according to the expected structure
    const shippingInfo: CheckoutRequest = {
      firstName: this.shippingForm.get('firstName')?.value,
      lastName: this.shippingForm.get('lastName')?.value,
      email: this.shippingForm.get('email')?.value,
      phone: this.shippingForm.get('phone')?.value,
      address: {
        street: this.shippingForm.get('address')?.value,
        city: this.shippingForm.get('city')?.value,
        postalCode: this.shippingForm.get('postalCode')?.value
      },
      shippingMethod: this.shippingForm.get('shippingMethod')?.value,
      shippingCost: selectedMethod?.price || 0
    };

    // Guardar email y teléfono en localStorage para usarlos en la página de pago
    localStorage.setItem('checkout_email', shippingInfo.email);
    localStorage.setItem('checkout_phone', shippingInfo.phone);
    localStorage.setItem('checkout_shipping_cost', selectedMethod?.price.toString() || '0');

    this.checkoutService.checkoutFormPersonalInfo(shippingInfo)
      .pipe(
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: (response) => {
          console.log('Información personal registrada correctamente', response);
          // Redirigimos a la página de pago/resumen en lugar de confirmación
          this.router.navigate(['/checkout/payment']);
        },
        error: (error) => {
          console.error('Error al enviar la información personal', error);
          // You could show an error message to the user here
        }
      });
  }
}
