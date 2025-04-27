export interface ProductResponseClient {
  items: Products[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface Products {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName: string;
  punctuation: number;
  imageUrl: string;
  status?: number;
  stock?: number;
  firstImage?: {
    id: number;
    imageUrl: string;
    createdAt: Date;
  };
}
