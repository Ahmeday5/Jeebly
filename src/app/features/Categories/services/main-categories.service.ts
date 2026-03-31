import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MainCategoriesResponse } from '../model/categories.type';

@Injectable({
  providedIn: 'root',
})
export class MainCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  constructor() {}

  /*******************************************categories*******************************************/

  // إضافة الفئات الرئيسية
  addCategories(formData: FormData): Observable<{ message: string }> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Categories`;

    return this.http.post<{ message: string }>(url, formData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'حدث خطأ أثناء إضافة الفئة';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `خطأ: ${error.error.message}`;
        } else {
          errorMessage = `كود الخطأ ${error.status}: ${error.message}`;
        }
        console.error('خطأ في إضافة الفئة:', error);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  // جلب الفئات الرئيسية
  getAllCategories(serviceId: number): Observable<MainCategoriesResponse> {
    const token = localStorage.getItem('token');
    let headers = {};
    if (token) {
      headers = { Authorization: `Bearer ${token}` };
    }
    return this.http
      .get<MainCategoriesResponse>(
        `${this.baseUrl}/api/Categories/GetAllCategories?serviceId=${serviceId}`,
        { headers },
      )
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب كل الفئات:', error);
          return throwError(() => new Error('فشل جلب كل الفئات'));
        }),
      );
  }
}
