export interface CheckoutRequest {
  firstName:      null;
  lastName:       null;
  email:          null;
  phone:          null;
  address:        Address;
  shippingMethod: null;
  shippingCost:   number;
}

export interface Address {
  street:     null;
  city:       null;
  postalCode: null;
}

export interface CheckoutPersonalResponse{
  message:string,
  addressId:number
}
