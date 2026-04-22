import { inject, Injectable } from '@angular/core';
import { Order, OrdersResponse } from '../../../../model/orderRestaurant.type';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../../../core/services/api.service';

const ORDER_STATUS_MAP: Record<string, string> = {
  معلق: 'Pending',
  مقبول: 'Confirmed',
  'تحت المعالجة': 'Cooking',
  'الاكل في الطريق': 'ReadyToDeliver',
  اتسلمت: 'Delivered',
  اتلغت: 'Canceled',
  فشل: 'Failed',
  'فشل الدفع': 'FailedPayment',
  اتكررت: 'Repeated',
  اترددت: 'Refunded',
  'تناول الطعام في المكان': 'DineIn',
  'offline payment': 'VerifyOfflinePayment',
};
@Injectable({
  providedIn: 'root',
})
export class OrdersRestService {
  private readonly api = inject(ApiService);

  constructor() {}

  // ====================== GET FILTERED ORDERS ======================
  getOrdersFiltered(
    id: number,
    status: string = '',
    code: string = '',
    deliveryManName: string = '',
  ): Observable<OrdersResponse> {
    const params = this.buildParams(status, code, deliveryManName);
    return this.api.get<OrdersResponse>(
      `/api/Orders/GetOrdersByRestaurant/${id}`,
      params,
    );
  }

  // ====================== HELPERS ======================
  private buildParams(
    status?: string,
    code?: string,
    deliveryManName?: string,
  ): HttpParams {
    let params = new HttpParams();

    if (status && status !== 'الكل') {
      const apiStatus = ORDER_STATUS_MAP[status];
      if (apiStatus) {
        params = params.set('status', apiStatus);
      }
    }

    if (code?.trim()) {
      params = params.set('code', code.trim());
    }
    if (deliveryManName?.trim()) {
      params = params.set('deliveryManName', deliveryManName.trim());
    }

    return params;
  }
}
