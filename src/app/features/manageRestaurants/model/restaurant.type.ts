export interface Restaurant {
  id: number;
  serviceId: number;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  latitude: number;
  longitude: number;
  foodType: number;
  areaId: number;
  areaName: string | null;
  logo: string;
  coverUrl: string;
  taxPercentage: number;
  minDeliveryTime: number;
  maxDeliveryTime: number;
  ownerFirstName: string;
  ownerLastName: string | null;
  ownerPhone: string | null;
  ownerEmail: string;
  notes?: string;
}

export interface FilteredRestaurant {
  id: number;
  serviceId: number | null;
  nameOfResturantAr: string;
  nameOfResturantEn: string;
  nameOfResturantOwner: string;
  areaOfResturantAr: string | null;
  areaOfResturantEn: string | null;
  status: string;
  categoryName: string[];
}

export interface CountResponse {
  data: number;
}

export interface PaginatedResponse<T> {
  statusCode: number;
  message: string;
  data: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    data: T[];
  };
}
