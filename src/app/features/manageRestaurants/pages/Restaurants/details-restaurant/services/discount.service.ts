import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Discount, DiscountPayload } from '../../../../model/discount.type';
import { ApiService } from '../../../../../../core/services/api.service';
import { environment } from '../../../../../../../environments/environment.prod';


@Injectable({ providedIn: 'root' })
export class DiscountService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getDiscounts(restaurantId: number): Observable<Discount[]> {
    return this.api
      .get<any>(`/api/Discounts/restaurant/${restaurantId}`)
      .pipe(map((res) => res.data ?? []));
  }

  addDiscount(payload: DiscountPayload): Observable<Discount[]> {
    return this.api
      .post<any>('/api/Discounts', payload)
      .pipe(map((res) => res.data ?? []));
  }

  updateDiscount(id: number, payload: DiscountPayload): Observable<Discount> {
    return this.api.put<Discount>(`/api/Discounts/${id}`, payload);
  }

  deleteDiscount(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/api/Discounts/${id}`, {
      responseType: 'text',
    });
  }
}
