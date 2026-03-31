import { Routes } from '@angular/router';

export const CAMPAIGNS_ROUTES: Routes = [
  {
    path: 'list-basicCampaign',
    loadComponent: () =>
      import('./pages/list-basic-campaign/list-basic-campaign.component').then(
        (m) => m.ListBasicCampaignComponent,
      ),
    title: 'حملة أساسية',
  },
  {
    path: 'add-basicCampaign',
    loadComponent: () =>
      import('./pages/add-basic-campaign/add-basic-campaign.component').then(
        (m) => m.AddBasicCampaignComponent,
      ),
    title: 'إضافة حملة',
  },
  {
    path: 'list-foodCampaign',
    loadComponent: () =>
      import('./pages/listfood-campaign/listfood-campaign.component').then(
        (m) => m.ListfoodCampaignComponent,
      ),
    title: 'حملة اكل',
  },
  {
    path: 'add-foodCampaign',
    loadComponent: () =>
      import('./pages/addfood-campaign/addfood-campaign.component').then(
        (m) => m.AddfoodCampaignComponent,
      ),
    title: 'إضافة حملة اكل',
  },
];
