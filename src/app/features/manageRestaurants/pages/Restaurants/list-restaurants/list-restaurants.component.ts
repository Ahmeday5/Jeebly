import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FilteredRestaurant } from '../../../model/restaurant.type';
import { RestaurantsService } from '../../../services/restaurants.service';

@Component({
  selector: 'app-list-restaurants',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // خيارات الـ status
  statuses = ['Pending', 'Active', 'Inactive']; // أضف المزيد لو حابب

  constructor(
    private apiService: RestaurantsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadRestaurants();
  }

  loadStatistics(): void {
    this.apiService.getRestaurantsCount().subscribe({
      next: (res) => (this.totalCount = res.count || 0),
      error: (err) => console.error('Error loading total count:', err),
    });

    this.apiService.getActiveRestaurantsCount().subscribe({
      next: (res) => (this.activeCount = res.activeCount || 0),
      error: (err) => console.error('Error loading active count:', err),
    });

    this.apiService.getNotActiveRestaurantsCount().subscribe({
      next: (res) => (this.notActiveCount = res.notactiveCount || 0),
      error: (err) => console.error('Error loading not active count:', err),
    });
  }

  loadRestaurants(): void {
    this.apiService
      .getFilteredRestaurants(this.selectedStatus, this.restaurantName)
      .subscribe({
        next: (data) => (this.restaurants = data),
        error: (err) => {
          this.showAlert('danger', 'فشل جلب قائمة المطاعم');
          console.error('Error loading restaurants:', err);
        },
      });
  }

  onFilterChange(): void {
    this.loadRestaurants();
  }

  showAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    setTimeout(() => {
      this.alertMessage = null;
      this.alertType = null;
    }, 5000);
  }

  detailsRestaurant(): void {
    this.router.navigate(['manageRestaurants/details-restaurant']);
  }

  editRestaurant(id: number): void {
    this.router.navigate(['manageRestaurants/edit-restaurant', id]);
  }
}
