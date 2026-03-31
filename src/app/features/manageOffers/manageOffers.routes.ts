import { Routes } from '@angular/router';

export const MANAGE_OFFERS_ROUTES: Routes = [
  {
    // ─── Offers ──────────────────────────────────────────
    path: 'add-Coupons',
    loadComponent: () =>
      import('./pages/coupons/coupons.component').then(
        (m) => m.CouponsComponent,
      ),
    title: 'إضافة كوبون',
  },
  {
    path: 'add-Cashback',
    loadComponent: () =>
      import('./pages/cashback/cashback.component').then(
        (m) => m.CashbackComponent,
      ),
    title: 'إضافة عرض استرداد جديد',
  },
  {
    path: 'add-Banner',
    loadComponent: () =>
      import('./pages/banners/banners.component').then(
        (m) => m.BannersComponent,
      ),
    title: 'إضافة بانر جديد',
  },
  {
    path: 'add-PromotionalBanner',
    loadComponent: () =>
      import('./pages/promotional-banner/promotional-banner.component').then(
        (m) => m.PromotionalBannerComponent,
      ),
    title: 'إضافة بانر ترويجي جديد',
  },
  // ─── Advertisements ──────────────────────────────────
  {
    path: 'add-Ad',
    loadComponent: () =>
      import('./pages/advertisements/new-ad/new-ad.component').then(
        (m) => m.NewAdComponent,
      ),
    title: 'إضافة اعلان جديد',
  },
  {
    path: 'requests-Ads',
    loadComponent: () =>
      import('./pages/advertisements/advertisement-requests/advertisement-requests.component').then(
        (m) => m.AdvertisementRequestsComponent,
      ),
    title: 'طلبات الاعلانات',
  },

  {
    path: 'Notifications',
    loadComponent: () =>
      import('./pages/notifications/notifications.component').then(
        (m) => m.NotificationsComponent,
      ),
    title: 'الاشعارات',
  },
];
