export interface Discount {
  id: number;
  restaurantId: number;
  discountAmount: number;
  minimumPurchase: number;
  maximumDiscount: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface DiscountPayload {
  restaurantId: number;
  discountAmount: number;
  minimumPurchase: number;
  maximumDiscount: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}
