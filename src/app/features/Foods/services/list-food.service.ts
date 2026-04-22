import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Product, ProductListResponse, RestaurantCategory, RestaurantProduct } from '../model/food.type';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly api = inject(ApiService);

  getProducts(pageNumber = 1, pageSize = 10) {
    return this.api
      .get<ProductListResponse>('/api/Products', { pageNumber, pageSize })
      .pipe(
        map((res) => ({
          products: res.data.data,
          totalPages: res.data.totalPages,
          totalCount: res.data.totalCount,
        })),
      );
  }

  getProductById(id: number): Observable<Product> {
    return this.api
      .get<any>(`/api/Products/products/${id}`)
      .pipe(map((res) => res.data));
  }

  getCategoriesByRestaurant(restaurantId: number): Observable<RestaurantCategory[]> {
    return this.api
      .get<any>(`/api/CategoriesClient/${restaurantId}/Categories`)
      .pipe(map((res) => res.data ?? []));
  }

  getRestaurantProducts(restaurantId: number): Observable<RestaurantProduct[]> {
    return this.api
      .get<any>(`/api/Products/${restaurantId}/products`)
      .pipe(map((res) => (Array.isArray(res) ? res : res.data ?? [])));
  }

  addProduct(formData: FormData): Observable<any> {
    return this.api.post<any>('/api/Products', formData);
  }

  updateProduct(id: number, formData: FormData): Observable<any> {
    return this.api.put<any>(`/api/Products/${id}`, formData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.api.delete(`/api/Products/${id}`);
  }
}
