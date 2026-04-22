import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { Restaurant } from '../../../model/restaurant.type';
import { Observable } from 'rxjs';
import { RestaurantsService } from '../../../services/restaurants.service';

@Component({
  selector: 'app-details-restaurant',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './details-restaurant.component.html',
  styleUrl: './details-restaurant.component.scss',
})
export class DetailsRestaurantComponent {
  restaurant$!: Observable<Restaurant>;
  restaurantId!: number;

  constructor(
    private route: ActivatedRoute,
    private api: RestaurantsService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));

    this.restaurant$ = this.api.getRestaurantById(id);
  }
}
