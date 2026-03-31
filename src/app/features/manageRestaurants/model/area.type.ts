// EmployeeAdvance type
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
