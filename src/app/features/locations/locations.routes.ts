import { Routes } from '@angular/router';

export const locationsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list-locations/list-locations.component').then(
        (m) => m.ListLocationsComponent
      ),
  },
];
