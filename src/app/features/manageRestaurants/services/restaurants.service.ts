import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { map, Observable, of } from 'rxjs';
import {
  FilteredRestaurant,
  Restaurant,
  CountResponse,
  PaginatedResponse,
} from '../model/restaurant.type';

@Injectable({
  providedIn: 'root',
})
export class RestaurantsService {
  private readonly api = inject(ApiService);

  // ========================== ADD RESTAURANT ==========================
  addRestaurant(formData: FormData): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(
      '/api/AddRestaurant/AddRestaurant',
      formData,
    );
  }

  // ========================== GET FILTERED RESTAURANTS ==========================
  getFilteredRestaurants(
    status: string = '',
    restaurantName: string = '',
    pageNumber: number = 1,
    pageSize: number = 10,
  ) {
    const params: any = {
      pageNumber,
      pageSize,
    };

    if (status) params.status = status;
    if (restaurantName) params.ResturantName = restaurantName;

    return this.api
      .get<
        PaginatedResponse<FilteredRestaurant>
      >('/api/AddRestaurant/GetResturantsFiltered', params)
      .pipe(
        map((res) => ({
          restaurants: res.data.data,
          totalPages: res.data.totalPages,
          totalCount: res.data.totalCount,
        })),
      );
  }
  
  // ========================== GET RESTAURANTS COUNT ==========================
  getRestaurantsCount(): Observable<CountResponse> {
    return this.api.get<CountResponse>('/api/AddRestaurant/restaurants/count');
  }

  // ========================== GET ACTIVE RESTAURANTS COUNT ==========================
  getActiveRestaurantsCount(): Observable<CountResponse> {
    return this.api.get<CountResponse>('/api/AddRestaurant/active-count');
  }

  // ========================== GET NOT ACTIVE RESTAURANTS COUNT ==========================
  getNotActiveRestaurantsCount(): Observable<CountResponse> {
    return this.api.get<CountResponse>('/api/AddRestaurant/Notactive-count');
  }

  // ========================== GET RESTAURANT BY ID ==========================
  getRestaurantById(id: number): Observable<Restaurant> {
    return this.api
      .get<any>(`/api/AddRestaurant/${id}/RestaurantById`)
      .pipe(map((res) => res.data));
  }

  // ========================== GET RESTAURANT FOR EDIT (includes categoryName) ==========================
  getRestaurantForEdit(id: number): Observable<any> {
    return this.api
      .get<any>(`/api/AddRestaurant/${id}`)
      .pipe(map((res) => res.data));
  }

  // ========================== UPDATE RESTAURANT ==========================
  updateRestaurant(formData: FormData): Observable<{ message: string }> {
    return this.api.put<{ message: string }>(
      '/api/AddRestaurant/UpdateRestaurant',
      formData,
    );
  }

  // ========================== CHANGE RESTAURANT STATUS ==========================
  changeRestaurantStatus(
    id: number,
    status: 'Active' | 'notActive',
  ): Observable<string> {
    const url = `/api/AddRestaurant/change-status/${id}?status=${status}`;

    return this.api.put<string>(url, null, {
      responseType: 'text' as 'json',
    });
  }
}
