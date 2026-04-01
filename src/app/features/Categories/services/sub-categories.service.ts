import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SubCategoriesResponse } from '../model/categories.type';

@Injectable({
  providedIn: 'root',
})
export class SubCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  constructor() {}
  
  getSubCategoriesByCategoryId(
    categoryId: number,
  ): Observable<SubCategoriesResponse> {
    const token = localStorage.getItem('token');
    let headers = {};
    if (token) {
      headers = { Authorization: `Bearer ${token}` };
    }

    return this.http
      .get<SubCategoriesResponse>(
        `${this.baseUrl}/api/Categories/${categoryId}/subcategories`,
        { headers },
      )
      .pipe(
        catchError((error) => {
          console.error(
            `خطأ في جلب الفئات الفرعية للفئة ${categoryId}:`,
            error,
          );
          return throwError(() => new Error('فشل جلب الفئات الفرعية'));
        }),
      );
  }
}
