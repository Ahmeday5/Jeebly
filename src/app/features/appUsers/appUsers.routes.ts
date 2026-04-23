import { Routes } from '@angular/router';

export const appUsersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list-users/list-users.component').then(
        (m) => m.ListUsersComponent
      ),
  },
];
