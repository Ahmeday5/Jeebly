import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MainCategoriesResponse, MainCategory } from '../model/categories.type';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class MainCategoriesService {
  private readonly api = inject(ApiService);

  /*******************************************categories*******************************************/

  // إضافة الفئات الرئيسية
  addCategories(formData: FormData): Observable<any> {
    return this.api.post<any>('/api/Categories/CreateCategory', formData);
  }

  getAllCategories(serviceId: number) {
    return this.api
      .get<
        MainCategoriesResponse<MainCategory>
      >(`/api/Categories/GetAllCategories?serviceId=${serviceId}`)
      .pipe(
        map((res) => ({
          Categories: res.data,
        })),
      );
  }

  // ====================== GET CATEGORY BY ID ======================
  getCategoryById(id: number) {
    return this.api.get<any>(`/api/Categories/GetCategoryById?id=${id}`);
  }

  // ====================== UPDATE CATEGORY ======================
  updateCategory(formData: FormData) {
    return this.api.post<any>('/api/Categories/UpdateCategory', formData);
  }

  // ====================== DELETE CATEGORY ======================
  deleteCategory(id: number) {
    return this.api.delete(`/api/Categories/DeleteCategory?id=${id}`);
  }
}
