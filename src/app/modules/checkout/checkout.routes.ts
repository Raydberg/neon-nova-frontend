import { Routes } from '@angular/router';
import { ShippingComponent } from './shipping/shipping.component';
import { PaymentComponent } from './payment/payment.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { CheckoutComponent } from './checkout.component';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    component: CheckoutComponent,
    children: [
      { path: '', redirectTo: 'shipping', pathMatch: 'full' },
      { path: 'shipping', component: ShippingComponent },
      { path: 'payment', component: PaymentComponent },
      { path: 'confirmation', component: ConfirmationComponent }
    ]
  }
];

export default CHECKOUT_ROUTES;
