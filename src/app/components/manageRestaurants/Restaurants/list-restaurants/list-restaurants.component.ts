import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-list-restaurants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-restaurants.component.html',
  styleUrl: './list-restaurants.component.scss',
})
export class ListRestaurantsComponent {
  constructor(private router: Router) {}

  detailsRestaurant() {
    this.router.navigate(['/details-restaurant']);
  }

  editRestaurant() {
    this.router.navigate(['/edit-restaurant']);
  }
}
