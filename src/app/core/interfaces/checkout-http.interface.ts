export interface CheckoutRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  shippingMethod: string;
  shippingCost: number;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
}

export interface CheckoutPersonalResponse {
  message: string;
  addressId: number;
}

export interface PaymentRequest {
  lineItems: LineItem[];
  currency: string;
  shippingCost: number;
  customerEmail: string;
  customerPhone: string;
}

export interface LineItem {
  priceData: PriceData;
  quantity: number;
}

export interface PriceData {
  currency: string;
  productData: ProductData;
  unitAmount: number;
}

export interface ProductData {
  name: string;
  metadata: any;
}

export interface PaymentResponse {
  url: string;  // URL to redirect to Stripe
  sessionId: string;
}
