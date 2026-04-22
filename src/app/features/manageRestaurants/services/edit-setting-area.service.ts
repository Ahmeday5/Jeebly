import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { allArea, allAreaDeliveryFees } from '../model/area.type';

@Injectable({
  providedIn: 'root',
})
export class EditSettingAreaService {
  private readonly api = inject(ApiService);

  constructor() {}
  // جلب منطقة واحدة
  getAreaById(id: number): Observable<any> {
    return this.api.get<allArea[]>(`/api/Areas/${id}`);
  }

  // تعديل  منطقة
  updateArea(
    id: number,
    body: {
      nameAr: string;
      nameEn: string;
      latitude: number;
      longitude: number;
      point3: number;
    },
  ): Observable<{ success: boolean; message: string }> {
    return this.api.put<{ success: boolean; message: string }>(
      `/api/Areas/${id}`,
      body,
    );
  }

  getByIdAreaDeliveryFees(id: number): Observable<any> {
    return this.api.get<allAreaDeliveryFees[]>(`/api/Areas/${id}/GetByIdAreaDeliveryFees`);
  }

  // تعديل  منطقة
  updateAreaDeliveryFees(
    areaId: number,
    body: {
      lowestDeliveryFees: number;
      maximumDeliveryFees: number;
      deliveryFeePerKilometre: number;
      increasedDeliveryFees: number;
      messageOfIncreasedDeliveryFees: string;
    },
  ): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>(
      `/api/Areas/Area/${areaId}/DeliveryFees`,
      body,
    );
  }
}
