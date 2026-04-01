import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { allArea } from '../model/area.type';

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

  // تعديل سلفة
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
}
