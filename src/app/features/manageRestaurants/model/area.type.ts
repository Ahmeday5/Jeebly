// allArea type
export interface allArea {
  id: number;
  nameAr: string;
  nameEn: string;
  restaurantNames: string[];
  deliveryManName: string;
}

export interface AreaResponse {
  data: allArea[];
}

export interface allAreaDeliveryFees {
  id: number;
  lowestDeliveryFees: number;
  maximumDeliveryFees: number;
  deliveryFeePerKilometre: number;
  increasedDeliveryFees: number;
  messageOfIncreasedDeliveryFees: string;
}

export interface AreaDeliveryFeesResponse {
  data: allAreaDeliveryFees[];
}
