import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})

export class TransactionsComponent {
  constructor(private router: Router) {}

  filters: string[] = [
    'النقد المجموع من قبل المسئول (0)',
    'الطلب المجموع من قبل المسئول (0)',
    'السحوبات (0)',
  ];

  // الفلتر الحالي المختار
  activeFilter: string = 'النقد المجموع من قبل المسئول (0)';

  // دالة لتغيير الفلتر عند الضغط
  setFilter(filter: string) {
    this.activeFilter = filter;
  }

  addFood() {
    this.router.navigate(['/add-food']);
  }
}
