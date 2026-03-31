import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable, of } from 'rxjs';
import {
  FilteredRestaurant,
  Restaurant,
  CountResponse,
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
  ): Observable<FilteredRestaurant[]> {
    const params: Record<string, string> = {};
    if (status) params['status'] = status;
    if (restaurantName) params['ResturantName'] = restaurantName;

    // تحويل الـ params ل query string
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `/api/AddRestaurant/GetResturantsFiltered?${queryString}`
      : '/api/AddRestaurant/GetResturantsFiltered';

    return this.api.get<FilteredRestaurant[]>(url);
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
    return this.api.get<Restaurant>(`/api/AddRestaurant/${id}/RestaurantById`);
  }

  // ========================== UPDATE RESTAURANT ==========================
  updateRestaurant(formData: FormData): Observable<{ message: string }> {
    return this.api.put<{ message: string }>(
      '/api/AddRestaurant/UpdateRestaurant',
      formData,
    );
  }
}
