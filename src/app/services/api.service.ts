import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { LoginCredentials, LoginResponse } from '../types/login.type';
import { Order, OrdersResponse } from '../types/orders.type';
import {
  MainCategoriesResponse,
  SubCategoriesResponse,
} from '../types/categories.type';
import { allArea, AreaResponse } from '../types/area.type';

@Injectable({
  providedIn: 'root', // جعل الخدمة متاحة لكل التطبيق
})
export class ApiService {
  private baseUrl = 'http://78.89.159.126:9393/TheOneAPIJeebly';

  constructor(private http: HttpClient) {}

  /***********************************login********************************************/

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const loginUrl = `${this.baseUrl}/api/Auth/login`;

    return this.http.post<LoginResponse>(loginUrl, credentials).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'حدث خطأ غير معروف';
        if (error.status === 0) {
          errorMessage = 'فشل الاتصال بالخادم. تحقق من الشبكة.';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'بيانات الإدخال غير صحيحة.';
        } else if (error.status === 401) {
          errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
        } else if (error.status === 503) {
          errorMessage = 'الخادم غير متاح حاليًا. حاول لاحقًا.';
        }
        console.error('خطأ في تسجيل الدخول:', error);
        return throwError(() => ({
          status: error.status,
          message: errorMessage,
        }));
      })
    );
  }

  /*******************************************order*********************************************/

  getOrdersFiltered(
    status: string = '',
    code: string = ''
  ): Observable<Order[]> {
    let params = new HttpParams();

    // إذا كان الفلتر مش "الكل"، نحول العربي للإنجليزي الفعلي اللي الـ API بيفهمه (من الأمثلة مثل 'Pending')
    if (status && status !== 'الكل') {
      // الـ map الجديد بناءً على الـ JSON: كل فلتر عربي يقابل orderStatus الإنجليزي
      const statusMap: { [key: string]: string } = {
        معلق: 'Pending',
        مقبول: 'Confirmed',
        'تحت المعالجة': 'Cooking',
        'الاكل في الطريق': 'ReadyToDeliver',
        اتسلمت: 'Delivered',
        اتلغت: 'Canceled',
        فشل: 'Failed',
        'فشل الدفع': 'FailedPayment',
        اتكررت: 'Repeated',
        اترددت: 'Refunded',
        'تناول الطعام في المكان': 'DineIn',
        'offline payment': 'VerifyOfflinePayment',
      };
      const apiStatus = statusMap[status];
      if (apiStatus) {
        params = params.set('status', apiStatus); // الـ param هو 'status=Pending' زي الأمثلة
      }
    }

    // إذا كان فيه code، أضفه مع trim عشان يشيل مسافات
    if (code && code.trim() !== '') {
      params = params.set('code', code.trim());
    }

    const url = `${this.baseUrl}/api/AllOrders/GetOrdersFiltered`;

    return this.http.get<Order[]>(url, { params }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('خطأ في جلب الطلبات:', error);
        return throwError(() => error);
      })
    );
  }

  /*******************************************categories*******************************************/

  // جلب الفئات الرئيسية
  getAllCategories(): Observable<MainCategoriesResponse> {
    const token = localStorage.getItem('token');
    let headers = {};
    if (token) {
      headers = { Authorization: `Bearer ${token}` };
    }
    return this.http
      .get<MainCategoriesResponse>(
        `${this.baseUrl}/api/Categories/GetAllCategories`,
        { headers }
      )
      .pipe(
        catchError((error) => {
          console.error('خطأ في جلب كل الفئات:', error);
          return throwError(() => new Error('فشل جلب كل الفئات'));
        })
      );
  }

  getSubCategoriesByCategoryId(
    categoryId: number
  ): Observable<SubCategoriesResponse> {
    const token = localStorage.getItem('token');
    let headers = {};
    if (token) {
      headers = { Authorization: `Bearer ${token}` };
    }

    return this.http
      .get<SubCategoriesResponse>(
        `${this.baseUrl}/api/Categories/${categoryId}/subcategories`,
        { headers }
      )
      .pipe(
        catchError((error) => {
          console.error(
            `خطأ في جلب الفئات الفرعية للفئة ${categoryId}:`,
            error
          );
          return throwError(() => new Error('فشل جلب الفئات الفرعية'));
        })
      );
  }

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

    const url = `${this.baseUrl}/api/Areas`;

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
        })
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
      })
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
      })
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
    }
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
        })
      );
  }
}
