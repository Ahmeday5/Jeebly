import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-basic-campaign',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-basic-campaign.component.html',
  styleUrl: './list-basic-campaign.component.scss',
})
export class ListBasicCampaignComponent {
  constructor(private router: Router) {}

  addCampaign() {
    this.router.navigate(['Campaigns/add-basicCampaign']);
  }
}
