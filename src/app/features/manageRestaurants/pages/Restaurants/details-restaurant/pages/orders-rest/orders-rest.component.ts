import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Order, OrdersResponse } from '../../../../../model/orderRestaurant.type';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from '../../../../../../../shared/pagination/pagination.component';
import { FormsModule } from '@angular/forms';
import { OrdersRestService } from '../../services/orders.rest.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../../../../../core/services/toast.service';

@Component({
  selector: 'app-orders-rest',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './orders-rest.component.html',
  styleUrl: './orders-rest.component.scss',
})
export class OrdersRestComponent implements OnInit, OnDestroy {
  [x: string]: any;
  // قائمة الفلاتر (الأزرار)
  filters: string[] = [
    'الكل',
    'معلق',
    'مقبول',
    'تحت المعالجة',
    'الاكل في الطريق',
    'اتسلمت',
    'اتلغت',
    'فشل',
    'فشل الدفع',
    'اتكررت',
    'اترددت',
    'تناول الطعام في المكان',
    'offline payment',
  ];
  // قائمة الفلاتر (الأزرار)
  /*filters: string[] = [
    'كل الطلبات',
    'طلبات مجدولة',
    'طلبات معلقة',
    'طلبات تم تسليمها',
    'طلبات ملغية',
  ];*/

  // الفلتر الحالي المختار
  activeFilter: string = 'الكل';
  orders: Order[] = [];
  id: any;

  // للعرض في الجدول (الصفحة الحالية فقط بعد pagination)
  displayedOrders: Order[] = [];
  loading = false;
  // للبحث برقم الطلب
  searchCode: string = '';
  searchdeliveryManName: string = '';

  pageSize: number = 10;
  currentPage: number = 1;
  totalItems: number = 0;

  // للـ debounce عشان ما نبعتش طلب كل ما نكتب حرف
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // خطوة تفصيلية: ده عشان statusArabic مش موجود في الـ JSON, فهنحوله هنا
  private statusArabicMap: { [key: string]: string } = {
    Pending: 'معلق',
    Confirmed: 'مقبول',
    Cooking: 'تحت المعالجة',
    ReadyToDeliver: 'الاكل في الطريق',
    Delivered: 'اتسلمت',
    Canceled: 'اتلغت',
    Refunded: 'اترددت',
    Failed: 'فشل',
    Repeated: 'اتكررت',
    DineIn: 'تناول الطعام في المكان',
    VerifyOfflinePayment: 'offline payment',
    FailedPayment: 'فشل الدفع',
  };

  getStatusBadgeClass(status: string): string {
    const badgeMap: { [key: string]: string } = {
      Pending: 'bg-warning text-dark', // أصفر
      Confirmed: 'bg-info text-white', // سماوي
      Cooking: 'bg-primary text-white', // أزرق غامق
      ReadyToDeliver: 'bg-orange text-white', // برتقالي (نضيف كلاس مخصص أو نستخدم bg-warning)
      Delivered: 'bg-success text-white', // أخضر
      Canceled: 'bg-danger text-white', // أحمر
      Refunded: 'bg-secondary text-white', // رمادي
      Failed: 'bg-dark text-white', // للحالات الغريبة
      Repeated: 'bg-purple text-white', // بنفسجي (نضيف كلاس مخصص)
      DineIn: 'bg-pink text-white', // وردي
      VerifyOfflinePayment: 'bg-cyan text-white', // سماوي فاتح
      FailedPayment: 'bg-dark text-white', // أسود
    };

    return badgeMap[status] || 'bg-secondary text-white'; // fallback
  }

  constructor(
    private apiService: OrdersRestService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const idParam = Number(this.route.parent?.snapshot.paramMap.get('id'));
    if (!idParam) {
      this.toast.error('لم يتم تحديد المطعم');
      return;
    }

    const id = Number(idParam);
    if (isNaN(id)) {
      this.toast.error('معرف غير صالح');
      return;
    }
    // جلب الطلبات الأولي
    this.loadOrders(id);

    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadOrders(id); // كل تغيير في سيرش, اجلب الطلبات الجديدة
      });
  }

  ngOnDestroy(): void {
    // تنظيف الـ subscriptions عشان متكونش memory leak
    this.destroy$.next();
    this.destroy$.complete();
  }

  // تغيير الفلتر وإعادة جلب الطلبات
  setFilter(filter: string) {
    this.activeFilter = filter;
    this.currentPage = 1; // رجع للصفحة 1 بعد فلتر جديد
    this.loadOrders(this.id);
  }

  // عند تغيير السيرش input
  onSearchCodeChange() {
    this.searchSubject.next(this.searchCode); // أرسل القيمة للـ debounce
    this.searchSubject.next(this.searchdeliveryManName); // أرسل القيمة للـ debounce
  }

  // جلب الطلبات من الـ API
  loadOrders(id: number) {
    this.loading = true; // ابدأ الـ loading spinner

    this.apiService
      .getOrdersFiltered(
        id,
        this.activeFilter,
        this.searchCode,
        this.searchdeliveryManName,
      )
      .subscribe({
        next: (response: OrdersResponse) => {
          // الـ response array مباشرة, مش .data
          this.orders = response?.data || [];
          this.totalItems = this.orders.length;
          this.currentPage = 1; // رجع للصفحة 1 بعد جلب جديد
          this.updateDisplayedOrders(); // حدث الطلبات المعروضة
          this.loading = false;
        },
        error: (err) => {
          console.error('فشل تحميل الطلبات', err);
          this.orders = [];
          this.displayedOrders = [];
          this.totalItems = 0;
          this.loading = false;
        },
      });
  }

  updateDisplayedOrders() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayedOrders = this.orders.slice(
      startIndex,
      startIndex + this.pageSize,
    );
  }

  // عند تغيير الصفحة من الـ pagination component
  onPageChange(page: number) {
    this.currentPage = page;
    this.updateDisplayedOrders(); // حدث العرض فورًا بدون إعادة جلب من API
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  // دالة لتنسيق التاريخ
  formatDate(date: string): string {
    return date.split('T')[0]; // استخراج YYYY-MM-DD فقط
  }

  getStatusArabic(status: string): string {
    return this.statusArabicMap[status] || status;
  }

  // تسمح فقط بالأرقام (0-9) وتمنع أي حروف أو رموز
  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;

    // إذا كان الضغط على مفتاح غير رقم → امنعه
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  exportCSV(): void {
    if (!this.displayedOrders.length) return;

    const headers = [
      '#',
      'رقم الطلب',
      'تاريخ الطلب',
      'اسم العميل',
      'عنوان العميل',
      'محافظة العميل',
      'منطقة العميل',
      'المطاعم',
      'المبلغ الاجمالي',
      'حالة الطلب',
    ];
    const rows = this.displayedOrders.map((d, i) => [
      ((this.currentPage - 1) * this.pageSize + i + 1).toString(),
      d.orderNumber,
      this.formatDate(d.orderDate),
      d.customerFullName,
      d.customerAddress,
      d.customerGovernorate,
      d.customerDistrict,
      d.restaurantName,
      d.totalAmount,
      this.getStatusArabic(d.orderStatus),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `الطلبات${new Date().toLocaleDateString('ar-EG')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
