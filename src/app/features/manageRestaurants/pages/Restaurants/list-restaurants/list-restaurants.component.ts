import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FilteredRestaurant } from '../../../model/restaurant.type';
import { RestaurantsService } from '../../../services/restaurants.service';
import { PaginationComponent } from '../../../../../shared/pagination/pagination.component';
import { forkJoin } from 'rxjs';

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
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' | null = null;
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
          this.showAlert('danger', 'فشل جلب قائمة المطاعم');
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
    // تأكيد قبل التغيير
    const confirmChange = confirm(
      `هل أنت متأكد من تغيير حالة المطعم إلى ${newStatus}?`,
    );
    if (!confirmChange) return;

    this.apiService.changeRestaurantStatus(restaurant.id, newStatus).subscribe({
      next: (res) => {
        // تحديث الحالة في الـ UI مباشرة بعد نجاح الطلب
        this.restaurants[index].status = newStatus;
        this.showAlert('success', 'تم تغيير الحالة بنجاح');
      },
      error: (err) => {
        this.showAlert('danger', 'فشل تغيير حالة المطعم');
        console.error('Error changing restaurant status:', err);
      },
    });
  }

  showAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    setTimeout(() => {
      this.alertMessage = null;
      this.alertType = null;
    }, 3000);
  }

  detailsRestaurant(): void {
    this.router.navigate(['manageRestaurants/details-restaurant']);
  }

  editRestaurant(id: number): void {
    this.router.navigate(['manageRestaurants/edit-restaurant', id]);
  }
}
