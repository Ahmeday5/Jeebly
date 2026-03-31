import { inject, Injectable } from '@angular/core';
import { Order } from '../model/orders.type';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  constructor() {}

  /*******************************************order*********************************************/

  getOrdersFiltered(
    status: string = '',
    code: string = '',
  ): Observable<Order[]> {
    let params = new HttpParams();

    // إذا كان الفلتر مش "الكل"، نحول العربي للإنجليزي الفعلي اللي الـ API بيفهمه (من الأمثلة مثل 'Pending')
    if (status && status !== 'الكل') {
      // الـ map الجديد بناءً على الـ JSON: كل فلتر عربي يقابل orderStatus الإنجليزي
      const statusMap: { [key: string]: string } = {
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
      const apiStatus = statusMap[status];
      if (apiStatus) {
        params = params.set('status', apiStatus); // الـ param هو 'status=Pending' زي الأمثلة
      }
    }

    // إذا كان فيه code، أضفه مع trim عشان يشيل مسافات
    if (code && code.trim() !== '') {
      params = params.set('code', code.trim());
    }

    const url = `${this.baseUrl}/api/AllOrders/GetOrdersFiltered`;

    return this.http.get<Order[]>(url, { params }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('خطأ في جلب الطلبات:', error);
        return throwError(() => error);
      }),
    );
  }
}
