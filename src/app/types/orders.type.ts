export interface OrderItem {
  id: number;
  supplierProductId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  orderNumber: number;
  orderDate: string;
  restaurantName: string;
  totalAmount: number;
  orderStatus: string;
  customerFullName: string;
  customerAddress: string;
  customerGovernorate: string;
  customerDistrict: string;
}

export type OrdersResponse = Order[];
