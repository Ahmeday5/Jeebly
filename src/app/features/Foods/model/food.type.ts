export interface Product {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  isActive: boolean;
  lang: string | null;
  imageUrl: string;
  price: number;
  categoryId: number;
  categoryName: string | null;
  subCategoryId: number | null;
  subCategoryName: string | null;
  restaurantId: number | null;
  serviceId: number | null;
  quantity: number | null;
}

export interface RestaurantCategory {
  id: number;
  name: string;
  image: string;
}
export interface serviceRestaurant {
  id: number;
  nameAr: string;
  nameEn: string;
}

export interface ProductListResponse {
  statusCode: number;
  message: string;
  data: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    data: Product[];
  };
}

export interface RestaurantProduct {
  id: number;
  nameAr: string;
  nameEn: string;
  price: number;
  imageUrl: string;
}
