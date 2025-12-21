import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listfood-campaign',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listfood-campaign.component.html',
  styleUrl: './listfood-campaign.component.scss',
})
export class ListfoodCampaignComponent {
  constructor(private router: Router) {}

  addFoodCampaign() {
    this.router.navigate(['/add-foodCampaign']);
  }
}
