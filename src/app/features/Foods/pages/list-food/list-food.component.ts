import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-food',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-food.component.html',
  styleUrl: './list-food.component.scss',
})
export class ListFoodComponent {
  constructor(private router: Router) {}
  // قائمة الفلاتر (الأزرار)
  filters: string[] = ['الكل', 'جميع المطاعم', 'جميع الفئات'];

  // الفلتر الحالي المختار
  activeFilter: string = 'الكل';

  // دالة لتغيير الفلتر عند الضغط
  setFilter(filter: string) {
    this.activeFilter = filter;
  }

  editFood() {
    this.router.navigate(['Foods/edit-food']);
  }
}
