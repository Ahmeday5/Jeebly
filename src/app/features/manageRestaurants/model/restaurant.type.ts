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
  serviceId: number;
  nameOfResturantAr: string;
  nameOfResturantEn: string;
  nameOfResturantOwner: string;
  areaOfResturantAr: string;
  areaOfResturantEn: string;
  status: string;
  categoryName: string[];
}

export interface CountResponse {
  count?: number;
  activeCount?: number;
  notactiveCount?: number;
}