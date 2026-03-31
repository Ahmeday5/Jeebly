import { Routes } from '@angular/router';

export const MANAGE_RESTAURANTS_ROUTES: Routes = [
  {
    path: 'add-restaurant',
    loadComponent: () =>
      import('./pages/Restaurants/add-restaurant/add-restaurant.component').then(
        (m) => m.AddRestaurantComponent,
      ),
    title: 'إضافة مطعم',
  },
  {
    path: 'list-restaurants',
    loadComponent: () =>
      import('./pages/Restaurants/list-restaurants/list-restaurants.component').then(
        (m) => m.ListRestaurantsComponent,
      ),
    title: 'قائمة المطاعم',
  },
  {
    path: 'edit-restaurant/:id',
    loadComponent: () =>
      import('./pages/Restaurants/edit-restaurant/edit-restaurant.component').then(
        (m) => m.EditRestaurantComponent,
      ),
    title: 'تحديث مطعم',
  },
  {
    path: 'newJoin-Request',
    loadComponent: () =>
      import('./pages/Restaurants/new-join-request/new-join-request.component').then(
        (m) => m.NewJoinRequestComponent,
      ),
    title: 'طلب انضمام جديد',
  },
  {
    path: 'setting-areas',
    loadComponent: () =>
      import('./pages/setting-areas/setting-areas.component').then(
        (m) => m.SettingAreasComponent,
      ),
    title: 'إعداد المناطق',
  },
  {
    path: 'sett-area',
    loadComponent: () =>
      import('./pages/setting-areas/sett-area/sett-area.component').then(
        (m) => m.SettAreaComponent,
      ),
    title: 'إعداد منطقة تجارية',
  },
  {
    path: 'edit-setting-area/:id',
    loadComponent: () =>
      import('./pages/edit-setting-area/edit-setting-area.component').then(
        (m) => m.EditSettingAreaComponent,
      ),
    title: 'تعديل المناطق',
  },
  {
    path: 'type-food',
    loadComponent: () =>
      import('./pages/type-food/type-food.component').then(
        (m) => m.TypeFoodComponent,
      ),
    title: 'نوع الاكل',
  },

  // ─── Restaurant Details (nested routes) ──────────────
  {
    path: 'details-restaurant',
    loadComponent: () =>
      import('./pages/Restaurants/details-restaurant/details-restaurant.component').then(
        (m) => m.DetailsRestaurantComponent,
      ),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/Restaurants/details-restaurant/pages/overview/overview.component').then(
            (m) => m.OverviewComponent,
          ),
        title: 'نظرة عامة',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/Restaurants/details-restaurant/pages/orders-rest/orders-rest.component').then(
            (m) => m.OrdersRestComponent,
          ),
        title: 'الطلبات',
      },
      {
        path: 'foods',
        loadComponent: () =>
          import('./pages/Restaurants/details-restaurant/pages/foods/foods.component').then(
            (m) => m.FoodsComponent,
          ),
        title: 'الأكلات',
      },
      {
        path: 'ratings',
        loadComponent: () =>
          import('./pages/Restaurants/details-restaurant/pages/ratings/ratings.component').then(
            (m) => m.RatingsComponent,
          ),
        title: 'التقييمات',
      },
      {
        path: 'discounts',
        loadComponent: () =>
          import('./pages/Restaurants/details-restaurant/pages/discounts/discounts.component').then(
            (m) => m.DiscountsComponent,
          ),
        title: 'الخصومات',
      },
      {
        path: 'Meta',
        loadComponent: () =>
          import('./pages/Restaurants/details-restaurant/pages/meta/meta.component').then(
            (m) => m.MetaComponent,
          ),
        title: 'Meta',
      },
      {
        path: 'Payments',
        loadComponent: () =>
          import('./pages/Restaurants/details-restaurant/pages/payments/payments.component').then(
            (m) => m.PaymentsComponent,
          ),
        title: 'المدفوعات',
      },
      {
        path: 'QRcode',
        loadComponent: () =>
          import('./pages/Restaurants/details-restaurant/pages/qrcode/qrcode.component').then(
            (m) => m.QRcodeComponent,
          ),
        title: 'QRcode',
      },
      {
        path: 'Settings',
        loadComponent: () =>
          import('./pages/Restaurants/details-restaurant/pages/settings/settings.component').then(
            (m) => m.SettingsComponent,
          ),
        title: 'الاعدادات',
      },
      {
        path: 'Transactions',
        loadComponent: () =>
          import('./pages/Restaurants/details-restaurant/pages/transactions/transactions.component').then(
            (m) => m.TransactionsComponent,
          ),
        title: 'المعاملات',
      },
      {
        path: 'Conversations',
        loadComponent: () =>
          import('./pages/Restaurants/details-restaurant/pages/conversations/conversations.component').then(
            (m) => m.ConversationsComponent,
          ),
        title: 'المحادثات',
      },
      {
        path: 'Buisness',
        loadComponent: () =>
          import('./pages/Restaurants/details-restaurant/pages/buisness/buisness.component').then(
            (m) => m.BuisnessComponent,
          ),
        title: 'Buisness',
      },
    ],
  },
  {
    path: 'add-food',
    loadComponent: () =>
      import('./pages/Restaurants/details-restaurant/pages/foods/add-food/add-food.component').then(
        (m) => m.AddFoodComponent,
      ),
    title: 'إضافة طعام',
  },
];
