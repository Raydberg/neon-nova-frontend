export interface CategoryModel {
  items:      Item[];
  totalItems: number;
  pageNumber: number;
  pageSize:   number;
  totalPages: number;
}

export interface Item {
  id:           number;
  name:         string;
  description:  string;
  createdAt:    Date;
  productCount: number;
}
