import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { allArea } from '../model/area.type';

@Injectable({
  providedIn: 'root',
})
export class SettingAreasService {
  private readonly api = inject(ApiService);
  constructor() {}

  /**********************************************areas****************************************************/
  // إضافة منطقة تجارية جديدة
  addArea(body: {
    nameAr: string;
    nameEn: string;
    latitude: number;
    longitude: number;
    point3: number;
  }): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/api/Areas/AddArea', body);
  }

  // get all Area
  getAllArea(): Observable<allArea[]> {
    return this.api.get<allArea[]>('/api/Areas/GetListOfAreas');
  }
}
