import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Truck } from 'lucide-angular';

@Component({
  selector: 'checkout-shipping',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './shipping.component.html',
  styles: [`
    .form-section {
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
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
  // Iconos
  // readonly ArrowLeftIcon = ArrowLeft;
  // readonly TruckIcon = Truck;

  // Router para navegación
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Formulario reactivo
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

  // Métodos de envío disponibles
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

  // Continuar al siguiente paso
  continueToPayment(): void {
    if (this.shippingForm.valid) {
      // Aquí guardarías los datos del formulario en un servicio
      // o en localStorage antes de navegar
      this.router.navigate(['/checkout/payment']);
    } else {
      this.shippingForm.markAllAsTouched();
    }
  }
}
