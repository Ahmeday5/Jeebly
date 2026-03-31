import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-foods',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './foods.component.html',
  styleUrl: './foods.component.scss',
})
export class FoodsComponent {
  constructor(private router: Router) {}

  filters: string[] = [
    'الكل',
    'الطعام النشط',
    'الطعام غير النشط',
  ];

  // الفلتر الحالي المختار
  activeFilter: string = 'الكل';

  // دالة لتغيير الفلتر عند الضغط
  setFilter(filter: string) {
    this.activeFilter = filter;
  }

  addFood() {
    this.router.navigate(['/add-food']);
  }
}
