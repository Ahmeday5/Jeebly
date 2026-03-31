import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders-rest',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-rest.component.html',
  styleUrl: './orders-rest.component.scss'
})

export class OrdersRestComponent {
 // قائمة الفلاتر (الأزرار)
  filters: string[] = [
    'كل الطلبات',
    'طلبات مجدولة',
    'طلبات معلقة',
    'طلبات تم تسليمها',
    'طلبات ملغية',
  ];

  // الفلتر الحالي المختار
  activeFilter: string = 'كل الطلبات';

  // دالة لتغيير الفلتر عند الضغط
  setFilter(filter: string) {
    this.activeFilter = filter;
  }
}
