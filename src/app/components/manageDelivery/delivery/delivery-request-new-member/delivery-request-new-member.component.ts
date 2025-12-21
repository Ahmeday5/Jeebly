import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delivery-request-new-member',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delivery-request-new-member.component.html',
  styleUrl: './delivery-request-new-member.component.scss'
})

export class DeliveryRequestNewMemberComponent {
  // قائمة الفلاتر (الأزرار)
  filters: string[] = [
    'سائق قيد الإنتظار',
    'تم رفض السائق',
  ];

  // الفلتر الحالي المختار
  activeFilter: string = 'سائق قيد الإنتظار';

  // دالة لتغيير الفلتر عند الضغط
  setFilter(filter: string) {
    this.activeFilter = filter;
  }
}
