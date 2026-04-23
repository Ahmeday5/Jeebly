import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../../../../core/services/api.service';
import { RestaurantSetting } from '../../../../model/setting.type';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly api = inject(ApiService);

  getSettings(restaurantId: number): Observable<RestaurantSetting | null> {
    return this.api
      .get<any>(`/api/Settings/${restaurantId}`)
      .pipe(map((res) => res.data ?? null));
  }

  createSettings(payload: RestaurantSetting): Observable<any> {
    return this.api.post<any>('/api/Settings', payload);
  }

  updateSettings(payload: RestaurantSetting): Observable<any> {
    return this.api.put<any>('/api/Settings', payload);
  }
}
