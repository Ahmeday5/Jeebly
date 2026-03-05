import { CanActivateFn, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service'; // تأكد من المسار الصحيح
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { authGuard, loginGuard } from './core/guards/auth.guard';

// ────────────────────────────────────────────────
// الروتات الرئيسية
export const routes: Routes = [
  // ─── Auth Routes ──────────────────────────────────────
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        canActivate: [loginGuard],
        loadComponent: () =>
          import('./components/login/login.component').then(m => m.LoginComponent),
        title: 'تسجيل الدخول',
      },

      // redirect إذا دخل /auth مباشرة
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ─── Main Protected Routes ─────────────────────────────
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // الصفحة الافتراضية بعد اللوجن
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'اللوحة الرئيسية',
      },

      // ─── Orders & Delivery ──────────────────────────────
      {
        path: 'Orders',
        loadComponent: () =>
          import('./components/manageOrder/orders/orders.component').then(m => m.OrdersComponent),
        title: 'الطلبيات',
      },
      {
        path: 'subscription-requests',
        loadComponent: () =>
          import('./components/manageOrder/subscription-requests/subscription-requests.component').then(m => m.SubscriptionRequestsComponent),
        title: 'طلبيات الاشتراكات',
      },
      {
        path: 'delivery-search',
        loadComponent: () =>
          import('./components/manageOrder/deliveryManagement/delivery-search/delivery-search.component').then(m => m.DeliverySearchComponent),
        title: 'بحث عن دليفري',
      },
      {
        path: 'request-progress',
        loadComponent: () =>
          import('./components/manageOrder/deliveryManagement/requests-progress/requests-progress.component').then(m => m.RequestsProgressComponent),
        title: 'طلبات شغالة',
      },
      {
        path: 'order-return',
        loadComponent: () =>
          import('./components/manageOrder/order-returns/order-returns.component').then(m => m.OrderReturnsComponent),
        title: 'مرتجعات',
      },

      // ─── Restaurants ─────────────────────────────────────
      {
        path: 'add-restaurant',
        loadComponent: () =>
          import('./components/manageRestaurants/Restaurants/add-restaurant/add-restaurant.component').then(m => m.AddRestaurantComponent),
        title: 'إضافة مطعم',
      },
      {
        path: 'list-restaurants',
        loadComponent: () =>
          import('./components/manageRestaurants/Restaurants/list-restaurants/list-restaurants.component').then(m => m.ListRestaurantsComponent),
        title: 'قائمة المطاعم',
      },
      {
        path: 'edit-restaurant',
        loadComponent: () =>
          import('./components/manageRestaurants/Restaurants/edit-restaurant/edit-restaurant.component').then(m => m.EditRestaurantComponent),
        title: 'تحديث مطعم',
      },
      {
        path: 'newJoin-Request',
        loadComponent: () =>
          import('./components/manageRestaurants/Restaurants/new-join-request/new-join-request.component').then(m => m.NewJoinRequestComponent),
        title: 'طلب انضمام جديد',
      },

      // ─── Areas ───────────────────────────────────────────
      {
        path: 'setting-areas',
        loadComponent: () =>
          import('./components/manageRestaurants/setting-areas/setting-areas.component').then(m => m.SettingAreasComponent),
        title: 'إعداد المناطق',
      },
      {
        path: 'sett-area',
        loadComponent: () =>
          import('./components/manageRestaurants/setting-areas/sett-area/sett-area.component').then(m => m.SettAreaComponent),
        title: 'إعداد منطقة تجارية',
      },
      {
        path: 'edit-setting-area/:id',
        loadComponent: () =>
          import('./components/manageRestaurants/edit-setting-area/edit-setting-area.component').then(m => m.EditSettingAreaComponent),
        title: 'تعديل المناطق',
      },

      {
        path: 'type-food',
        loadComponent: () =>
          import('./components/manageRestaurants/type-food/type-food.component').then(m => m.TypeFoodComponent),
        title: 'نوع الاكل',
      },

      // ─── Restaurant Details (nested routes) ──────────────
      {
        path: 'details-restaurant',
        loadComponent: () =>
          import('./components/manageRestaurants/Restaurants/details-restaurant/details-restaurant.component').then(m => m.DetailsRestaurantComponent),
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          {
            path: 'overview',
            loadComponent: () => import('./components/manageRestaurants/Restaurants/details-restaurant/overview/overview.component').then(m => m.OverviewComponent),
            title: 'نظرة عامة',
          },
          {
            path: 'orders',
            loadComponent: () => import('./components/manageRestaurants/Restaurants/details-restaurant/orders-rest/orders-rest.component').then(m => m.OrdersRestComponent),
            title: 'الطلبات',
          },
          {
            path: 'foods',
            loadComponent: () => import('./components/manageRestaurants/Restaurants/details-restaurant/foods/foods.component').then(m => m.FoodsComponent),
            title: 'الأكلات',
          },
          {
            path: 'ratings',
            loadComponent: () => import('./components/manageRestaurants/Restaurants/details-restaurant/ratings/ratings.component').then(m => m.RatingsComponent),
            title: 'التقييمات',
          },
          {
            path: 'discounts',
            loadComponent: () => import('./components/manageRestaurants/Restaurants/details-restaurant/discounts/discounts.component').then(m => m.DiscountsComponent),
            title: 'الخصومات',
          },
          {
            path: 'Meta',
            loadComponent: () => import('./components/manageRestaurants/Restaurants/details-restaurant/meta/meta.component').then(m => m.MetaComponent),
            title: 'Meta',
          },
          {
            path: 'Payments',
            loadComponent: () => import('./components/manageRestaurants/Restaurants/details-restaurant/payments/payments.component').then(m => m.PaymentsComponent),
            title: 'المدفوعات',
          },
          {
            path: 'QRcode',
            loadComponent: () => import('./components/manageRestaurants/Restaurants/details-restaurant/qrcode/qrcode.component').then(m => m.QRcodeComponent),
            title: 'QRcode',
          },
          {
            path: 'Settings',
            loadComponent: () => import('./components/manageRestaurants/Restaurants/details-restaurant/settings/settings.component').then(m => m.SettingsComponent),
            title: 'الاعدادات',
          },
          {
            path: 'Transactions',
            loadComponent: () => import('./components/manageRestaurants/Restaurants/details-restaurant/transactions/transactions.component').then(m => m.TransactionsComponent),
            title: 'المعاملات',
          },
          {
            path: 'Conversations',
            loadComponent: () => import('./components/manageRestaurants/Restaurants/details-restaurant/conversations/conversations.component').then(m => m.ConversationsComponent),
            title: 'المحادثات',
          },
          {
            path: 'Buisness',
            loadComponent: () => import('./components/manageRestaurants/Restaurants/details-restaurant/buisness/buisness.component').then(m => m.BuisnessComponent),
            title: 'Buisness',
          },
        ],
      },

      {
        path: 'add-food',
        loadComponent: () =>
          import('./components/manageRestaurants/Restaurants/details-restaurant/foods/add-food/add-food.component').then(m => m.AddFoodComponent),
        title: 'إضافة طعام',
      },

      // ─── Categories ──────────────────────────────────────
      {
        path: 'add-list-category',
        loadComponent: () =>
          import('./components/Categories/mainCategories/add-list/add-list.component').then(m => m.AddListComponent),
        title: 'قائمة الفئات',
      },
      {
        path: 'update-category',
        loadComponent: () =>
          import('./components/Categories/mainCategories/update-category/update-category.component').then(m => m.UpdateCategoryComponent),
        title: 'تحديث فئة',
      },
      {
        path: 'add-list-subcategory',
        loadComponent: () =>
          import('./components/Categories/subCategories/add-list-sub/add-list-sub.component').then(m => m.AddListSubComponent),
        title: 'قائمة الفئات الفرعية',
      },
      {
        path: 'update-subcategory',
        loadComponent: () =>
          import('./components/Categories/subCategories/update-sub-category/update-sub-category.component').then(m => m.UpdateSubCategoryComponent),
        title: 'تحديث فئة فرعية',
      },

      // ─── Foods ───────────────────────────────────────────
      {
        path: 'list-food',
        loadComponent: () =>
          import('./components/Foods/list-food/list-food.component').then(m => m.ListFoodComponent),
        title: 'قائمة الأطعمة',
      },
      {
        path: 'edit-food',
        loadComponent: () =>
          import('./components/Foods/edti-food/edti-food.component').then(m => m.EdtiFoodComponent),
        title: 'تعديل طعام',
      },
      {
        path: 'evaluation-food',
        loadComponent: () =>
          import('./components/Foods/evaluation-food/evaluation-food.component').then(m => m.EvaluationFoodComponent),
        title: 'تقييم الطعام',
      },

      // ─── Campaigns ───────────────────────────────────────
      {
        path: 'list-basicCampaign',
        loadComponent: () =>
          import('./components/Campaigns/list-basic-campaign/list-basic-campaign.component').then(m => m.ListBasicCampaignComponent),
        title: 'حملة أساسية',
      },
      {
        path: 'add-basicCampaign',
        loadComponent: () =>
          import('./components/Campaigns/add-basic-campaign/add-basic-campaign.component').then(m => m.AddBasicCampaignComponent),
        title: 'إضافة حملة',
      },
      {
        path: 'list-foodCampaign',
        loadComponent: () =>
          import('./components/Campaigns/listfood-campaign/listfood-campaign.component').then(m => m.ListfoodCampaignComponent),
        title: 'حملة اكل',
      },
      {
        path: 'add-foodCampaign',
        loadComponent: () =>
          import('./components/Campaigns/addfood-campaign/addfood-campaign.component').then(m => m.AddfoodCampaignComponent),
        title: 'إضافة حملة اكل',
      },

      // ─── Offers ──────────────────────────────────────────
      {
        path: 'add-Coupons',
        loadComponent: () =>
          import('./components/manageOffers/coupons/coupons.component').then(m => m.CouponsComponent),
        title: 'إضافة كوبون',
      },
      {
        path: 'add-Cashback',
        loadComponent: () =>
          import('./components/manageOffers/cashback/cashback.component').then(m => m.CashbackComponent),
        title: 'اضافة عرض استرداد جديد',
      },
      {
        path: 'add-Banner',
        loadComponent: () =>
          import('./components/manageOffers/banners/banners.component').then(m => m.BannersComponent),
        title: 'إضافة بانر جديد',
      },
      {
        path: 'add-PromotionalBanner',
        loadComponent: () =>
          import('./components/manageOffers/promotional-banner/promotional-banner.component').then(m => m.PromotionalBannerComponent),
        title: 'إضافة بانر ترويجي',
      },

      // ─── Advertisements ──────────────────────────────────
      {
        path: 'add-Ad',
        loadComponent: () =>
          import('./components/manageOffers/advertisements/new-ad/new-ad.component').then(m => m.NewAdComponent),
        title: 'إضافة اعلان جديد',
      },
      {
        path: 'requests-Ads',
        loadComponent: () =>
          import('./components/manageOffers/advertisements/advertisement-requests/advertisement-requests.component').then(m => m.AdvertisementRequestsComponent),
        title: 'طلبات الاعلانات',
      },

      {
        path: 'Notifications',
        loadComponent: () =>
          import('./components/manageOffers/notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'الاشعارات',
      },

      // ─── Customers ───────────────────────────────────────
      {
        path: 'Customers',
        loadComponent: () =>
          import('./components/manageCustomer/customers/customers.component').then(m => m.CustomersComponent),
        title: 'العملاء',
      },
      {
        path: 'Wallet-bonus',
        loadComponent: () =>
          import('./components/manageCustomer/Wallet/bonus/bonus.component').then(m => m.BonusComponent),
        title: 'مكافأة المحفظة',
      },
      {
        path: 'CustomerPoints-report',
        loadComponent: () =>
          import('./components/manageCustomer/LoyaltyPoint/customer-points-report/customer-points-report.component').then(m => m.CustomerPointsReportComponent),
        title: 'تقرير نقاط ولاء العميل',
      },
      {
        path: 'ListOfShared-emails',
        loadComponent: () =>
          import('./components/manageCustomer/list-of-shared-emails/list-of-shared-emails.component').then(m => m.ListOfSharedEmailsComponent),
        title: 'قائمة الإيميلات المشتركة',
      },

      // ─── Delivery Settings ───────────────────────────────
      {
        path: 'Setting-CarTypes',
        loadComponent: () =>
          import('./components/manageDelivery/setting-up-car-types/setting-up-car-types.component').then(m => m.SettingUpCarTypesComponent),
        title: 'إعداد أنواع العربيات',
      },
      {
        path: 'Shift-Setting',
        loadComponent: () =>
          import('./components/manageDelivery/shift-setting/shift-setting.component').then(m => m.ShiftSettingComponent),
        title: 'إعداد الشيفتات',
      },
      {
        path: 'RequestNew-delivery',
        loadComponent: () =>
          import('./components/manageDelivery/delivery/delivery-request-new-member/delivery-request-new-member.component').then(m => m.DeliveryRequestNewMemberComponent),
        title: 'طلب انضمام دليفري جديد',
      },

      // ─── 404 fallback داخل الـ main layout (اختياري) ───
      { path: '**', redirectTo: 'dashboard' },
    ],
  },

  // ─── Global fallback ─────────────────────────────────────
  { path: '**', redirectTo: '/auth/login' },
];
