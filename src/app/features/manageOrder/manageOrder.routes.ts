import { Routes } from '@angular/router';

export const MANAGE_ORDER_ROUTES: Routes = [
  {
    path: 'Orders',
    loadComponent: () =>
      import('./pages/orders/orders.component').then((m) => m.OrdersComponent),
    title: 'الطلبيات',
  },
  {
    path: 'subscription-requests',
    loadComponent: () =>
      import('./pages/subscription-requests/subscription-requests.component').then(
        (m) => m.SubscriptionRequestsComponent,
      ),
    title: 'طلبيات الاشتراكات',
  },
  {
    path: 'delivery-search',
    loadComponent: () =>
      import('./pages/deliveryManagement/delivery-search/delivery-search.component').then(
        (m) => m.DeliverySearchComponent,
      ),
    title: 'بحث عن دليفري',
  },
  {
    path: 'request-progress',
    loadComponent: () =>
      import('./pages/deliveryManagement/requests-progress/requests-progress.component').then(
        (m) => m.RequestsProgressComponent,
      ),
    title: 'طلبات شغالة',
  },
  {
    path: 'order-returns',
    loadComponent: () =>
      import('./pages/order-returns/order-returns.component').then(
        (m) => m.OrderReturnsComponent,
      ),
    title: 'مرتجعات',
  },
];
