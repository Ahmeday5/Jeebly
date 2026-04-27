import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../../../../core/services/api.service';
import {
  WorkingHour,
  WorkingHourPayload,
} from '../../../../model/working-hours.type';

@Injectable({ providedIn: 'root' })
export class WorkingHoursService {
  private readonly api = inject(ApiService);

  /** Fetch a single working-hours record by its id. */
  getById(id: number): Observable<WorkingHour | null> {
    return this.api
      .get<{ statusCode: number; message: string; data: WorkingHour | null }>(
        `/api/WorkingHours/${id}`,
      )
      .pipe(map((res) => res?.data ?? null));
  }

  /** List all working-hours records for a restaurant. */
  getByRestaurant(restaurantId: number): Observable<WorkingHour[]> {
    return this.api
      .get<{ data: WorkingHour[] } | WorkingHour[]>(
        `/api/WorkingHours/Restaurant/${restaurantId}`,
      )
      .pipe(
        map((res) => {
          if (Array.isArray(res)) return res;
          return res?.data ?? [];
        }),
      );
  }
  
  create(payload: WorkingHourPayload): Observable<{ statusCode: number; message: string }> {
    return this.api.post<{ statusCode: number; message: string }>(
      '/api/WorkingHours',
      payload,
    );
  }

  update(
    id: number,
    payload: WorkingHourPayload,
  ): Observable<{ statusCode: number; message: string }> {
    return this.api.put<{ statusCode: number; message: string }>(
      `/api/WorkingHours/${id}`,
      payload,
    );
  }

  delete(id: number): Observable<{ statusCode: number; message: string }> {
    return this.api.delete<{ statusCode: number; message: string }>(
      `/api/WorkingHours/${id}`,
    );
  }
}
