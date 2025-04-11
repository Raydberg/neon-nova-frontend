import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, CreditCard, Landmark } from 'lucide-angular';

@Component({
  selector: 'checkout-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './payment.component.html',
  styles: [`
    .payment-method-option {
      transition: all 0.2s ease-out;
    }

    .payment-method-option:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .payment-method-option.active {
      border-color: hsl(var(--p));
    }

    .card-details {
      animation: slideDown 0.4s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .confirm-btn {
      position: relative;
      overflow: hidden;
    }

    .confirm-btn::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transform: translateX(-100%);
    }

    .confirm-btn:hover:not(:disabled)::after {
      transform: translateX(100%);
      transition: transform 0.8s ease;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent {
  // Iconos
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CreditCardIcon = CreditCard;
  readonly LandmarkIcon = Landmark;

  // Router para navegación
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // State signals
  isProcessing = signal(false);

  // Formulario reactivo
  paymentForm: FormGroup = this.fb.group({
    paymentMethod: ['credit-card', [Validators.required]],
    cardName: ['', [Validators.required]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
  });

  // Métodos de pago disponibles
  paymentMethods = [
    {
      id: 'credit-card',
      name: 'Tarjeta de crédito/débito',
      icon: CreditCard
    },
    {
      id: 'bank-transfer',
      name: 'Transferencia bancaria',
      icon: Landmark
    }
  ];

  // Mostrar los campos de tarjeta solo si está seleccionado ese método
  get showCardFields(): boolean {
    return this.paymentForm.get('paymentMethod')?.value === 'credit-card';
  }

  // Simular el procesamiento del pago
  confirmOrder(): void {
    if (this.paymentForm.valid) {
      this.isProcessing.set(true);

      // Simulación de procesamiento
      setTimeout(() => {
        this.isProcessing.set(false);
        this.router.navigate(['/checkout/confirmation']);
      }, 1500);
    } else {
      this.paymentForm.markAllAsTouched();
    }
  }
}
