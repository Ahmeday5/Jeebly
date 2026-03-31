import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-new-join-request',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './new-join-request.component.html',
  styleUrl: './new-join-request.component.scss',
})
export class NewJoinRequestComponent {

  filters: string[] = [
    'Pending Request',
    'Rejected Request',
  ];

  // الفلتر الحالي المختار
  activeFilter: string = 'Pending Request';

  // دالة لتغيير الفلتر عند الضغط
  setFilter(filter: string) {
    this.activeFilter = filter;
  }
}
