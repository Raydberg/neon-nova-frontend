export interface CartShopClient {
  id:           number;
  creationDate: Date;
  status:       string;
  details:      Detail[];
  total:        number;
}

export interface Detail {
  id:          number;
  productId:   number;
  productName: string;
  imageUrl:    string;
  quantity:    number;
  unitPrice:   number;
  subtotal:    number;
}
