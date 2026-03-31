import { Routes } from '@angular/router';

export const MANAGE_CUSTOMER_ROUTES: Routes = [
  {
    path: 'Customers',
    loadComponent: () =>
      import('./pages/customers/customers.component').then(
        (m) => m.CustomersComponent,
      ),
    title: 'العملاء',
  },
  {
    path: 'Wallet-bonus',
    loadComponent: () =>
      import('./pages/Wallet/bonus/bonus.component').then(
        (m) => m.BonusComponent,
      ),
    title: 'مكافأة المحفظة',
  },
  {
    path: 'CustomerPoints-report',
    loadComponent: () =>
      import('./pages/LoyaltyPoint/customer-points-report/customer-points-report.component').then(
        (m) => m.CustomerPointsReportComponent,
      ),
    title: 'تقرير نقاط ولاء العميل',
  },
  {
    path: 'ListOfShared-emails',
    loadComponent: () =>
      import('./pages/list-of-shared-emails/list-of-shared-emails.component').then(
        (m) => m.ListOfSharedEmailsComponent,
      ),
    title: 'قائمة الإيميلات المشتركة',
  },
];
