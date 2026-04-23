import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  District,
  DistrictPayload,
  Governorate,
  GovernoratePayload,
} from '../model/location.type';

@Injectable({ providedIn: 'root' })
export class LocationsService {
  private readonly api = inject(ApiService);

  getAllGovernorates(): Observable<Governorate[]> {
    return this.api
      .get<any>('/api/GovernorateAndDistrict/ Get All Governorates')
      .pipe(map((res) => res.data ?? []));
  }

  createGovernorate(payload: GovernoratePayload): Observable<any> {
    return this.api.post<any>(
      '/api/GovernorateAndDistrict/CreateGovernorate',
      payload,
    );
  }

  getDistrictsByGovernorate(governorateId: number): Observable<District[]> {
    return this.api
      .get<any>(`/api/GovernorateAndDistrict/districts/${governorateId}`)
      .pipe(
        map((res) => res.data ?? []),
        catchError(() => of([])),
      );
  }

  createDistrict(payload: DistrictPayload): Observable<any> {
    return this.api.post<any>(
      '/api/GovernorateAndDistrict/CreateDistrict',
      payload,
    );
  }
}
