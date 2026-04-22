import { inject, Injectable } from '@angular/core';
import { Order, OrdersResponse } from '../model/orders.type';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

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
export class OrdersService {
  private readonly api = inject(ApiService);

  constructor() {}

  // ====================== GET FILTERED ORDERS ======================
  getOrdersFiltered(
    status: string = '',
    code: string = '',
  ): Observable<OrdersResponse> {
    const params = this.buildParams(status, code);
    return this.api.get<OrdersResponse>('/api/AllOrders/GetOrdersFiltered', params);
  }

  // ====================== HELPERS ======================
  private buildParams(status?: string, code?: string): HttpParams {
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

    return params;
  }
}
