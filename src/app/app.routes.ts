import { CanActivateFn, Router, Routes } from '@angular/router';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OrdersComponent } from './components/manageOrder/orders/orders.component';
import { SubscriptionRequestsComponent } from './components/manageOrder/subscription-requests/subscription-requests.component';
import { DeliverySearchComponent } from './components/manageOrder/deliveryManagement/delivery-search/delivery-search.component';
import { RequestsProgressComponent } from './components/manageOrder/deliveryManagement/requests-progress/requests-progress.component';
import { OrderReturnsComponent } from './components/manageOrder/order-returns/order-returns.component';
import { AddRestaurantComponent } from './components/manageRestaurants/Restaurants/add-restaurant/add-restaurant.component';
import { ListRestaurantsComponent } from './components/manageRestaurants/Restaurants/list-restaurants/list-restaurants.component';
import { NewJoinRequestComponent } from './components/manageRestaurants/Restaurants/new-join-request/new-join-request.component';
import { SettingAreasComponent } from './components/manageRestaurants/setting-areas/setting-areas.component';
import { SettAreaComponent } from './components/manageRestaurants/setting-areas/sett-area/sett-area.component';
import { EditSettingAreaComponent } from './components/manageRestaurants/edit-setting-area/edit-setting-area.component';
import { TypeFoodComponent } from './components/manageRestaurants/type-food/type-food.component';
import { DetailsRestaurantComponent } from './components/manageRestaurants/Restaurants/details-restaurant/details-restaurant.component';
import { TransactionsComponent } from './components/manageRestaurants/Restaurants/details-restaurant/transactions/transactions.component';
import { SettingsComponent } from './components/manageRestaurants/Restaurants/details-restaurant/settings/settings.component';
import { RatingsComponent } from './components/manageRestaurants/Restaurants/details-restaurant/ratings/ratings.component';
import { QRcodeComponent } from './components/manageRestaurants/Restaurants/details-restaurant/qrcode/qrcode.component';
import { PaymentsComponent } from './components/manageRestaurants/Restaurants/details-restaurant/payments/payments.component';
import { OverviewComponent } from './components/manageRestaurants/Restaurants/details-restaurant/overview/overview.component';
import { OrdersRestComponent } from './components/manageRestaurants/Restaurants/details-restaurant/orders-rest/orders-rest.component';
import { MetaComponent } from './components/manageRestaurants/Restaurants/details-restaurant/meta/meta.component';
import { FoodsComponent } from './components/manageRestaurants/Restaurants/details-restaurant/foods/foods.component';
import { AddFoodComponent } from './components/manageRestaurants/Restaurants/details-restaurant/foods/add-food/add-food.component';
import { DiscountsComponent } from './components/manageRestaurants/Restaurants/details-restaurant/discounts/discounts.component';
import { ConversationsComponent } from './components/manageRestaurants/Restaurants/details-restaurant/conversations/conversations.component';
import { BuisnessComponent } from './components/manageRestaurants/Restaurants/details-restaurant/buisness/buisness.component';
import { EditRestaurantComponent } from './components/manageRestaurants/Restaurants/edit-restaurant/edit-restaurant.component';
import { AddListComponent } from './components/Categories/mainCategories/add-list/add-list.component';
import { UpdateCategoryComponent } from './components/Categories/mainCategories/update-category/update-category.component';
import { AddListSubComponent } from './components/Categories/subCategories/add-list-sub/add-list-sub.component';
import { UpdateSubCategoryComponent } from './components/Categories/subCategories/update-sub-category/update-sub-category.component';
import { ListFoodComponent } from './components/Foods/list-food/list-food.component';
import { EdtiFoodComponent } from './components/Foods/edti-food/edti-food.component';
import { EvaluationFoodComponent } from './components/Foods/evaluation-food/evaluation-food.component';
import { ListBasicCampaignComponent } from './components/Campaigns/list-basic-campaign/list-basic-campaign.component';
import { AddBasicCampaignComponent } from './components/Campaigns/add-basic-campaign/add-basic-campaign.component';
import { ListfoodCampaignComponent } from './components/Campaigns/listfood-campaign/listfood-campaign.component';
import { AddfoodCampaignComponent } from './components/Campaigns/addfood-campaign/addfood-campaign.component';
import { CouponsComponent } from './components/manageOffers/coupons/coupons.component';
import { CashbackComponent } from './components/manageOffers/cashback/cashback.component';
import { BannersComponent } from './components/manageOffers/banners/banners.component';
import { PromotionalBannerComponent } from './components/manageOffers/promotional-banner/promotional-banner.component';
import { NewAdComponent } from './components/manageOffers/advertisements/new-ad/new-ad.component';
import { AdvertisementRequestsComponent } from './components/manageOffers/advertisements/advertisement-requests/advertisement-requests.component';
import { NotificationsComponent } from './components/manageOffers/notifications/notifications.component';
import { CustomersComponent } from './components/manageCustomer/customers/customers.component';
import { BonusComponent } from './components/manageCustomer/Wallet/bonus/bonus.component';
import { CustomerPointsReportComponent } from './components/manageCustomer/LoyaltyPoint/customer-points-report/customer-points-report.component';
import { ListOfSharedEmailsComponent } from './components/manageCustomer/list-of-shared-emails/list-of-shared-emails.component';
import { SettingUpCarTypesComponent } from './components/manageDelivery/setting-up-car-types/setting-up-car-types.component';
import { ShiftSettingComponent } from './components/manageDelivery/shift-setting/shift-setting.component';
import { DeliveryRequestNewMemberComponent } from './components/manageDelivery/delivery/delivery-request-new-member/delivery-request-new-member.component';

export const canActivate: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    map((isLoggedIn) => {
      if (!isLoggedIn) {
        return router.createUrlTree(['/login']);
      }
      return true;
    })
  );
};

export const canActivateRole: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['allowedRoles'] as string[]) || [];

  return authService.role$.pipe(
    map((role) => {
      if (!role || !allowedRoles.some((r) => role.includes(r))) {
        return router.createUrlTree(['/dashboard']);
      }
      return true;
    })
  );
};

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        return authService.isLoggedIn$.pipe(
          map((isLoggedIn) => {
            if (isLoggedIn) {
              return router.createUrlTree(['/dashboard']);
            }
            return true;
          })
        );
      },
    ],
  },
  {
    path: '',
    component: LoginComponent,
    canActivate: [canActivate],
    title: 'تسجيل الدخول',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'اللوحة الرئيسية',
  },
  {
    path: 'Orders',
    component: OrdersComponent,
    title: 'الطلبيات',
  },
  {
    path: 'subscription-requests',
    component: SubscriptionRequestsComponent,
    title: 'طلبيات الاشتراكات',
  },
  {
    path: 'delivery-search',
    component: DeliverySearchComponent,
    title: 'بحث عن دليفري',
  },
  {
    path: 'request-progress',
    component: RequestsProgressComponent,
    title: 'طلبات شغالة',
  },
  {
    path: 'order-return',
    component: OrderReturnsComponent,
    title: 'مرتجعات',
  },
  {
    path: 'add-restaurant',
    component: AddRestaurantComponent,
    title: 'إضافة مطعم',
  },
  {
    path: 'list-restaurants',
    component: ListRestaurantsComponent,
    title: 'قائمة المطاعم',
  },
  {
    path: 'edit-restaurant',
    component: EditRestaurantComponent,
    title: 'تحديث مطعم',
  },
  {
    path: 'newJoin-Request',
    component: NewJoinRequestComponent,
    title: 'طلب انضمام جديد',
  },
  {
    path: 'setting-areas',
    component: SettingAreasComponent,
    title: 'إعداد المناطق',
  },
  {
    path: 'sett-area',
    component: SettAreaComponent,
    title: 'إعداد منطقة تجارية',
  },
  {
    path: 'edit-setting-area',
    component: EditSettingAreaComponent,
    title: 'تعديل المناطق',
  },
  {
    path: 'type-food',
    component: TypeFoodComponent,
    title: 'نوع الاكل',
  },
  {
    path: 'details-restaurant',
    component: DetailsRestaurantComponent,
    children: [
      { path: 'overview', component: OverviewComponent, title: 'نظرة عامة' },
      { path: 'orders', component: OrdersRestComponent, title: 'الطلبات' },
      {
        path: 'foods',
        component: FoodsComponent,
        title: 'الأكلات',
      },
      { path: 'ratings', component: RatingsComponent, title: 'التقييمات' },
      { path: 'discounts', component: DiscountsComponent, title: 'الخصومات' },
      { path: 'Meta', component: MetaComponent, title: 'Meta' },
      { path: 'Payments', component: PaymentsComponent, title: 'المدفوعات' },
      { path: 'QRcode', component: QRcodeComponent, title: 'QRcode' },
      { path: 'Settings', component: SettingsComponent, title: 'الاعدادات' },
      {
        path: 'Transactions',
        component: TransactionsComponent,
        title: 'المعاملات',
      },
      {
        path: 'Conversations',
        component: ConversationsComponent,
        title: 'المحادثات',
      },
      { path: 'Buisness', component: BuisnessComponent, title: 'Buisness' },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
  {
    path: 'add-food',
    component: AddFoodComponent,
    title: 'إضافة طعام',
  },
  {
    path: 'add-list-category',
    component: AddListComponent,
    title: 'قائمة الفئات',
  },
  {
    path: 'update-category',
    component: UpdateCategoryComponent,
    title: 'تحديث فئة',
  },
  {
    path: 'add-list-subcategory',
    component: AddListSubComponent,
    title: 'قائمة الفئات الفرعية',
  },
  {
    path: 'update-subcategory',
    component: UpdateSubCategoryComponent,
    title: 'تحديث فئة فرعية',
  },
  {
    path: 'list-food',
    component: ListFoodComponent,
    title: 'قائمة',
  },
  {
    path: 'edit-food',
    component: EdtiFoodComponent,
    title: 'تعديل طعام',
  },
  {
    path: 'evaluation-food',
    component: EvaluationFoodComponent,
    title: 'تقييم الطعام',
  },
  {
    path: 'list-basicCampaign',
    component: ListBasicCampaignComponent,
    title: 'حملة أساسية',
  },
  {
    path: 'add-basicCampaign',
    component: AddBasicCampaignComponent,
    title: 'اضافة حملة',
  },
  {
    path: 'list-foodCampaign',
    component: ListfoodCampaignComponent,
    title: 'حملة اكل',
  },
  {
    path: 'add-foodCampaign',
    component: AddfoodCampaignComponent,
    title: 'اضافة حملة اكل',
  },
  {
    path: 'add-Coupons',
    component: CouponsComponent,
    title: 'اضافة كوبون',
  },
  {
    path: 'add-Cashback',
    component: CashbackComponent,
    title: 'اضافة عرض استرداد جديد',
  },
  {
    path: 'add-Banner',
    component: BannersComponent,
    title: 'إضافة بانر جديد',
  },
  {
    path: 'add-PromotionalBanner',
    component: PromotionalBannerComponent,
    title: 'إضافة بانر ترويجي',
  },
  {
    path: 'add-Ad',
    component: NewAdComponent,
    title: 'إضافة اعلان جديد',
  },
  {
    path: 'requests-Ads',
    component: AdvertisementRequestsComponent,
    title: 'طلبات الاعلانات',
  },
  {
    path: 'Notifications',
    component: NotificationsComponent,
    title: 'الاشعارات',
  },
  {
    path: 'Customers',
    component: CustomersComponent,
    title: 'العملاء',
  },
  {
    path: 'Wallet-bonus',
    component: BonusComponent,
    title: 'مكافأة المحفظة',
  },
  {
    path: 'CustomerPoints-report',
    component: CustomerPointsReportComponent,
    title: 'تقرير نقاط ولاء العميل',
  },
  {
    path: 'ListOfShared-emails',
    component: ListOfSharedEmailsComponent,
    title: 'قائمة الإيميلات المشتركة',
  },
  {
    path: 'Setting-CarTypes',
    component: SettingUpCarTypesComponent,
    title: 'إعداد أنواع العربيات',
  },
  {
    path: 'Shift-Setting',
    component: ShiftSettingComponent,
    title: 'إعداد الشيفتات',
  },
  {
    path: 'RequestNew-delivery',
    component: DeliveryRequestNewMemberComponent,
    title: 'طلب انضمام دليفري جديد',
  },
];
