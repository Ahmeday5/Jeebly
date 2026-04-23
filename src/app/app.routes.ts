import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 🔹 Auth Layout (Login)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
      },
    ],
  },

  // 🔹 Main Layout (Dashboard)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboards/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: 'manageOrder',
        loadChildren: () =>
          import('./features/manageOrder/manageOrder.routes').then(
            (m) => m.MANAGE_ORDER_ROUTES,
          ),
      },
      {
        path: 'manageRestaurants',
        loadChildren: () =>
          import('./features/manageRestaurants/manageRestaurants.routes').then(
            (m) => m.MANAGE_RESTAURANTS_ROUTES,
          ),
      },
      {
        path: 'Categories',
        loadChildren: () =>
          import('./features/Categories/Categories.routes').then(
            (m) => m.CATEGORIES_ROUTES,
          ),
      },
      {
        path: 'Foods',
        loadChildren: () =>
          import('./features/Foods/foods.routes').then((m) => m.FOODS_ROUTES),
      },
      {
        path: 'Campaigns',
        loadChildren: () =>
          import('./features/Campaigns/Campaigns.routes').then(
            (m) => m.CAMPAIGNS_ROUTES,
          ),
      },
      {
        path: 'manageOffers',
        loadChildren: () =>
          import('./features/manageOffers/manageOffers.routes').then(
            (m) => m.MANAGE_OFFERS_ROUTES,
          ),
      },
      {
        path: 'manageCustomers',
        loadChildren: () =>
          import('./features/manageCustomer/manageCustomer.routes').then(
            (m) => m.MANAGE_CUSTOMER_ROUTES,
          ),
      },
      {
        path: 'manageDelivery',
        loadChildren: () =>
          import('./features/manageDelivery/manageDelivery.routes').then(
            (m) => m.MANAGE_DELIVERY_ROUTES,
          ),
      },
      {
        path: 'locations',
        loadChildren: () =>
          import('./features/locations/locations.routes').then(
            (m) => m.locationsRoutes
          ),
      },
      {
        path: 'appUsers',
        loadChildren: () =>
          import('./features/appUsers/appUsers.routes').then(
            (m) => m.appUsersRoutes
          ),
      },
      { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // 🔹 Fallback
  { path: '**', redirectTo: '/auth/login' },
];
