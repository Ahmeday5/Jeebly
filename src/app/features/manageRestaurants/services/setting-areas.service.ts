import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';
import { allArea } from '../model/area.type';

@Injectable({
  providedIn: 'root',
})
export class SettingAreasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  constructor() {}
  /**********************************************areas****************************************************/
  // إضافة منطقة تجارية جديدة
  addArea(body: {
    nameAr: string;
    nameEn: string;
    latitude: number;
    longitude: number;
    point3: number;
  }): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Areas/AddArea`;

    return this.http
      .post(url, body, {
        headers,
        responseType: 'text', // ← مهم جدًا: نتعامل الـ response كنص
      })
      .pipe(
        map((textResponse: string) => {
          // أي نص يرجع من الباك = نجاح
          return {
            success: true,
            message: textResponse.trim() || 'تم إضافة المنطقة التجارية بنجاح',
          };
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'حدث خطأ غير معروف أثناء إضافة المنطقة';
          if (error.status === 0) {
            errorMessage = 'فشل الاتصال بالخادم. تحقق من الشبكة.';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'بيانات الإدخال غير صحيحة.';
          } else if (error.status === 401) {
            errorMessage = 'غير مصرح لك بإضافة المنطقة.';
          }
          console.error('خطأ في إضافة المنطقة:', error);
          return throwError(() => ({
            status: error.status,
            message: errorMessage,
          }));
        }),
      );
  }

  // get all Area
  getAllArea(): Observable<allArea[]> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // تأكد من الـ URL صحيح (فيه مسافة: Get List Of Areas)
    const url = `${this.baseUrl}/api/Areas/Get List Of Areas`;

    return this.http.get<allArea[]>(url, { headers }).pipe(
      // غير <AreaResponse> إلى <allArea[]>
      catchError((err) => {
        console.error('Error fetching All Areas:', err);
        return of([]); // رجع array فاضي في حالة خطأ
      }),
    );
  }

  // جلب منطقة واحدة
  getAreaById(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.baseUrl}/api/Areas/${id}`;

    return this.http.get<any>(url, { headers }).pipe(
      catchError((err) => {
        console.error('Error fetching Area by id:', err);
        return of({ data: {} });
      }),
    );
  }

  // تعديل سلفة
  updateArea(
    id: number,
    body: {
      nameAr: string;
      nameEn: string;
      latitude: number;
      longitude: number;
      point3: number;
    },
  ): Observable<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });

    const url = `${this.baseUrl}/api/Areas/${id}`;

    return this.http
      .put(url, body, {
        headers,
        responseType: 'text',
      })
      .pipe(
        map((textResponse: string) => ({
          success: true,
          message: textResponse.trim() || 'تم تعديل المنطقة بنجاح',
        })),
        catchError((error) => {
          let msg = 'فشل تعديل المنطقة';
          if (error.error && typeof error.error === 'string') {
            msg = error.error.trim();
          }
          return of({ success: false, message: msg });
        }),
      );
  }
}
