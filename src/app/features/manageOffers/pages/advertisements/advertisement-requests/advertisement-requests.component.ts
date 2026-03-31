import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-advertisement-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './advertisement-requests.component.html',
  styleUrl: './advertisement-requests.component.scss',
})
export class AdvertisementRequestsComponent {
  // قائمة الفلاتر (الأزرار)
  filters: string[] = [
    'طلب جديد',
    'طلب تحديث',
    'الطلبات المرفوضة',
  ];

  // الفلتر الحالي المختار
  activeFilter: string = 'طلب جديد';

  // دالة لتغيير الفلتر عند الضغط
  setFilter(filter: string) {
    this.activeFilter = filter;
  }
}
