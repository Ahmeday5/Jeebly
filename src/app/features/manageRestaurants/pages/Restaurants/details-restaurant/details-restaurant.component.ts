import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-details-restaurant',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './details-restaurant.component.html',
  styleUrl: './details-restaurant.component.scss',
})

export class DetailsRestaurantComponent {
  constructor(private router: Router) {}
}
