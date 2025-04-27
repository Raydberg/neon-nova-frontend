export interface ProductWithIDComment {
  comments:           Comment[];
  totalCommentsCount: number;
  commentsPageNumber: number;
  commentsPageSize:   number;
  commentsTotalPages: number;
  id:                 number;
  name:               string;
  description:        string;
  price:              number;
  category:           Category;
  createdAt:          Date;
  stock:              number;
  status:             number;
  images:             Image[];
}

export interface Category {
  id:          number;
  name:        string;
  description: string;
}

export interface Comment {
  id:          number;
  productId:   number;
  userId:      string;
  comment:     string;
  rating:      number;
  date:        Date;
  productName: string;
  userName:    string;
}

export interface Image {
  id:        number;
  imageUrl:  string;
  createdAt: Date;
}
