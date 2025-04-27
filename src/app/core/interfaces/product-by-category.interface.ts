export interface ProductByCategory {
  items:      Item[];
  totalItems: number;
  pageNumber: number;
  pageSize:   number;
  totalPages: number;
}

export interface Item {
  id:          number;
  name:        string;
  description: string;
  price:       number;
  category:    Category;
  createdAt:   Date;
  stock:       number;
  punctuation: number;
  status:      number;
  firstImage:  FirstImage;
}

export interface Category {
  id:          number;
  name:        string;
  description: string;
}

export interface FirstImage {
  id:        number;
  imageUrl:  string;
  createdAt: Date;
}
