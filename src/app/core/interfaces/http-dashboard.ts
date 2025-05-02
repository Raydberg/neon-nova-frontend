export interface DashboardStacks {
  userStats:     UserStats;
  productStats:  ProductStats;
  categoryStats: CategoryStats;
}

export interface CategoryStats {
  totalCategoriesCount:       number;
  categoriesGrowthPercentage: number;
  activeCategoriesCount:      number;
  topCategories:              TopCategory[];
}

export interface TopCategory {
  id:           number;
  name:         string;
  productCount: number;
}

export interface ProductStats {
  totalProductsCount:       number;
  productsGrowthPercentage: number;
  lowStockProductsCount:    number;
  lowStockProducts:         LowStockProduct[];
}

export interface LowStockProduct {
  id:    number;
  name:  string;
  stock: number;
}

export interface UserStats {
  activeUsersCount:      number;
  activeUsersPercentage: number;
  totalUsersCount:       number;
  newUsersThisWeek:      number;
  newUsersPercentage:    number;
}
