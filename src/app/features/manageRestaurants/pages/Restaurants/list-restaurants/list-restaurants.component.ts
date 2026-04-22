import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FilteredRestaurant } from '../../../model/restaurant.type';
import { RestaurantsService } from '../../../services/restaurants.service';
import { PaginationComponent } from '../../../../../shared/pagination/pagination.component';
import { forkJoin } from 'rxjs';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';

@Component({
  selector: 'app-list-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './list-restaurants.component.html',
  styleUrls: ['./list-restaurants.component.scss'],
})
export class ListRestaurantsComponent implements OnInit {
  restaurants: FilteredRestaurant[] = [];
  totalCount: number = 0;
  activeCount: number = 0;
  notActiveCount: number = 0;
  selectedStatus: string = '';
  restaurantName: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  isLoading: boolean = false;
  LoadingStatistics: boolean = false;

  // خيارات الـ status
  statuses = ['Pending', 'Active', 'notActive']; // أضف المزيد لو حابب

  constructor(
    private apiService: RestaurantsService,
    private router: Router,
    private toast: ToastService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadRestaurants();
  }

  loadStatistics(): void {
    this.LoadingStatistics = true;

    forkJoin({
      total: this.apiService.getRestaurantsCount(),
      active: this.apiService.getActiveRestaurantsCount(),
      notActive: this.apiService.getNotActiveRestaurantsCount(),
    }).subscribe({
      next: (res) => {
        this.totalCount = res.total.data || 0;
        this.activeCount = res.active.data || 0;
        this.notActiveCount = res.notActive.data || 0;

        this.LoadingStatistics = false; // ✅ هنا الصح
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
        this.LoadingStatistics = false; // ✅ مهم جدًا
      },
    });
  }

  loadRestaurants(): void {
    this.isLoading = true;
    this.apiService
      .getFilteredRestaurants(
        this.selectedStatus,
        this.restaurantName,
        this.currentPage,
        this.pageSize,
      )
      .subscribe({
        next: (res) => {
          this.restaurants = res.restaurants;
          this.totalPages = res.totalPages;
          this.totalCount = res.totalCount;
          this.isLoading = false;
        },
        error: (err) => {
          this.toast.error('فشل جلب قائمة المطاعم');
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadRestaurants();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRestaurants();
  }

  onStatusToggle(restaurant: FilteredRestaurant, index: number): void {
    const newStatus = restaurant.status === 'Active' ? 'notActive' : 'Active';
    const label = newStatus === 'Active' ? 'تفعيل' : 'تعطيل';

    this.confirm.confirm(`هل أنت متأكد من ${label} المطعم "${restaurant.nameAr}"؟`, 'تغيير الحالة').subscribe((ok) => {
      if (!ok) return;

      this.apiService.changeRestaurantStatus(restaurant.id, newStatus).subscribe({
        next: () => {
          this.restaurants[index].status = newStatus;
          this.toast.success('تم تغيير الحالة بنجاح');
        },
        error: (err) => {
          this.toast.error('فشل تغيير حالة المطعم');
          console.error('Error changing restaurant status:', err);
        },
      });
    });
  }

  detailsRestaurant(id: number): void {
    this.router.navigate(['manageRestaurants/details-restaurant', id]);
  }

  editRestaurant(id: number): void {
    this.router.navigate(['manageRestaurants/edit-restaurant', id]);
  }
}
