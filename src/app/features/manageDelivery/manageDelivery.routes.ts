import { Routes } from '@angular/router';

export const MANAGE_DELIVERY_ROUTES: Routes = [
  {
    path: 'Setting-CarTypes',
    loadComponent: () =>
      import('./pages/setting-up-car-types/setting-up-car-types.component').then(
        (m) => m.SettingUpCarTypesComponent,
      ),
    title: 'إعداد أنواع العربيات',
  },
  {
    path: 'Shift-Setting',
    loadComponent: () =>
      import('./pages/shift-setting/shift-setting.component').then(
        (m) => m.ShiftSettingComponent,
      ),
    title: 'إعداد الشيفتات',
  },
  {
    path: 'RequestNew-delivery',
    loadComponent: () =>
      import('./pages/delivery/delivery-request-new-member/delivery-request-new-member.component').then(
        (m) => m.DeliveryRequestNewMemberComponent,
      ),
    title: 'طلب انضمام دليفري جديد',
  },
];
