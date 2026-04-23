import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import {
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  Subscription,
} from 'rxjs';
import { SidebarService } from '../../core/services/sidebar.service';
import { ApiService } from '../../core/services/api.service';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule], // إضافة RouterModule لدعم routerLink و routerLinkActive
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewInit {
  isSidebarOpen: boolean = false;
  isCollapsed: boolean = false;
  isMobile = false;

  menuItems: any[] = [];
  filteredMenuItems: any[] = [];
  private searchSub: Subscription | null = null;
  @ViewChild('searchInput', { static: true })
  searchInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private sidebarService: SidebarService,
    private authService: AuthService,
    private apiService: ApiService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.updateMenuItems();
    this.updateSidebarState();

    // استرجاع حالة الـ submenu
    this.menuItems.forEach((section) => {
      section.items?.forEach((item: any) => {
        if (item.submenu && item.label) {
          const saved = localStorage.getItem(`submenu_${item.label}`);
          if (saved !== null) {
            item.isOpen = saved === 'true';
          }
        }
      });
    });

    // ⚠️ clone بعد ما تطبق الحالات
    this.filteredMenuItems = JSON.parse(JSON.stringify(this.menuItems));

    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed) {
      this.isCollapsed = savedCollapsed === 'true';
    }

    this.sidebarService.sidebar$.subscribe((isOpen) => {
      this.isSidebarOpen = isOpen;
    });
  }

  handleSpecialAction(subItem: any): void {
    if (subItem.key === 'تسجيل الخروج') {
      this.confirm.confirm('هل أنت متأكد من تسجيل الخروج؟', 'تسجيل الخروج').subscribe((ok) => {
        if (!ok) return;
        this.authService.logout();
        this.router.navigate(['/login']);
        this.sidebarService.close();
      });
    } /*else if (subItem.key === 'حذف الحساب') {
      if (
        confirm(
          'هل أنت متأكد من حذف حسابك نهائيًا؟ هذا الإجراء لا يمكن التراجع عنه!',
        )
      ) {
        this.deleteMyAccount();
      }
    }*/
  }

  /*private deleteMyAccount(): void {
    this.apiService.deleteMyAccount().subscribe({
      next: (response) => {
        alert(response.message || 'تم حذف الحساب بنجاح');
        this.authService.logout();
        this.router.navigate(['/login']);
        this.sidebarService.close(); // اختياري: إغلاق السايدبار
      },
      error: (err) => {
        alert(err.message || 'فشل حذف الحساب، حاول مرة أخرى لاحقًا');
      },
    });
  }*/

  closeSidebar() {
    this.sidebarService.close();
  }

  toggleCollapse(): void {
    if (window.innerWidth >= 993) {
      this.isCollapsed = !this.isCollapsed;
      localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
      window.dispatchEvent(new Event('resize'));
    }
  }

  ngAfterViewInit(): void {
    window.addEventListener('resize', () => this.updateSidebarState());

    this.searchSub = fromEvent(this.searchInputRef.nativeElement, 'input')
      .pipe(
        map((e: any) => e.target.value as string),
        map((v) => v.trim()),
        debounceTime(200),
        distinctUntilChanged(),
      )
      .subscribe((query) => {
        this.applyFilter(query);
      });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  private updateSidebarState(): void {
    this.isMobile = window.innerWidth <= 992;

    if (this.isMobile) {
      this.isSidebarOpen = false;
      this.isCollapsed = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  toggleSubmenu(sectionIndex: number, itemIndex: number): void {
    const section = this.filteredMenuItems[sectionIndex];
    if (!section?.items) return;

    const item = section.items[itemIndex];
    if (!item) return;

    item.isOpen = !item.isOpen;

    // حفظ حالة الفتح
    if (item.label) {
      localStorage.setItem(`submenu_${item.label}`, item.isOpen.toString());
    }
  }

  private applyFilter(query: string): void {
    if (!query) {
      this.filteredMenuItems = JSON.parse(JSON.stringify(this.menuItems));
      this.closeAllSubmenus(this.filteredMenuItems);
      return;
    }

    const q = query.toLowerCase();

    const result: any[] = [];

    for (const section of this.menuItems) {
      const clonedSection: any = { ...section };
      clonedSection.items = [];

      const titleMatches =
        section.title && section.title.toLowerCase().includes(q);

      if (titleMatches) {
        clonedSection.items = JSON.parse(JSON.stringify(section.items || []));
        if (clonedSection.items)
          clonedSection.items.forEach((it: any) => {
            if (it.submenu) it.isOpen = true;
          });
        result.push(clonedSection);
        continue;
      }

      if (section.items && section.items.length) {
        for (const item of section.items) {
          const itemLabel = (item.label || '').toLowerCase();
          let matchedItem: any = null;

          if (itemLabel.includes(q)) {
            matchedItem = JSON.parse(JSON.stringify(item));
            if (matchedItem.submenu) matchedItem.isOpen = true;
          } else if (item.submenu && item.submenu.length) {
            const matchingSub: any[] = [];
            for (const sub of item.submenu) {
              const subKey = (sub.key || '').toLowerCase();
              if (subKey.includes(q)) {
                matchingSub.push(JSON.parse(JSON.stringify(sub)));
              }
            }
            if (matchingSub.length) {
              matchedItem = {
                ...JSON.parse(JSON.stringify(item)),
                submenu: matchingSub,
                isOpen: true,
              };
            }
          }

          if (matchedItem) {
            clonedSection.items.push(matchedItem);
          }
        }

        if (clonedSection.items.length) {
          result.push(clonedSection);
        }
      }
    }

    this.filteredMenuItems = result;
  }

  private closeAllSubmenus(list: any[]): void {
    for (const section of list) {
      if (section.items && section.items.length) {
        for (const it of section.items) {
          if (it.submenu) it.isOpen = false;
        }
      }
    }
  }

  private updateMenuItems(): void {
    this.menuItems = [
      {
        items: [
          {
            label: 'اللوحة الرئيسية',
            path: 'dashboard/mainDashboard',
            icons: 'fa-solid fa-gauge-high',
          },
        ],
      },
      {
        title: 'إدارة الطلبات',
        items: [
          {
            label: 'الطلبات',
            path: 'manageOrder/Orders',
            icons: 'fa-solid fa-list-check',
          },
          {
            label: 'طلبات الاشتراكات',
            path: 'manageOrder/subscription-requests',
            icons: 'fa-solid fa-receipt',
          },
          {
            label: 'إدارة التوصيل',
            icons: 'fa-solid fa-truck-fast',
            submenu: [
              {
                key: 'البحث عن دليفري',
                path: 'manageOrder/delivery-search',
                icon: 'fa-solid fa-id-card',
              },
              {
                key: 'طلبات شغالة',
                path: 'manageOrder/request-progress',
                icon: 'fa-solid fa-map-location-dot',
              },
            ],
          },
          {
            label: 'مرتجعات الطلبات',
            icons: 'fa-solid fa-rotate-left',
            submenu: [
              {
                key: 'طلبات مرتجع جديدة',
                path: 'manageOrder/order-returns',
                icon: 'fa-solid fa-user-ninja',
              },
            ],
          },
        ],
      },
      {
        title: 'إدارة المطاعم',
        items: [
          {
            label: 'إعداد المناطق',
            path: 'manageRestaurants/setting-areas',
            icons: 'fa-solid fa-map',
          },
          /*{
            label: 'نوع الأكل',
            path: 'manageRestaurants/type-food',
            icons: 'fa-solid fa-utensils',
          },*/
          {
            label: 'مطاعم',
            icons: 'fa-solid fa-store',
            submenu: [
              {
                key: 'ضيف مطعم',
                path: 'manageRestaurants/add-restaurant',
                icon: 'fa-solid fa-burger',
              },
              {
                key: 'قائمة المطاعم',
                path: 'manageRestaurants/list-restaurants',
                icon: 'fa-solid fa-burger',
              },
              {
                key: 'طلب انضمام جديد',
                path: 'manageRestaurants/newJoin-Request',
                icon: 'fa-solid fa-star-half-stroke',
              },
            ],
          },
        ],
      },
      {
        title: 'إدارة الأكل',
        items: [
          {
            label: 'الفئات',
            icons: 'fa-solid fa-layer-group',
            submenu: [
              {
                key: 'فئة',
                path: 'Categories/add-list-category',
                icon: 'fa-solid fa-tags',
              },
              {
                key: 'فئة فرعية',
                path: 'Categories/add-list-subcategory',
                icon: 'fa-solid fa-diagram-project',
              },
            ],
          },
          {
            label: 'أكلات',
            icons: 'fa-solid fa-bowl-food',
            submenu: [
              {
                key: 'اضف جديد',
                path: 'Foods/add-food',
                icon: 'fa-solid fa-pizza-slice',
              },
              {
                key: 'قائمة الاكل',
                path: 'Foods/list-food',
                icon: 'fa-solid fa-carrot',
              },
              {
                key: 'تقييم',
                path: 'Foods/evaluation-food',
                icon: 'fa-solid fa-carrot',
              },
            ],
          },
        ],
      },
      {
        title: 'إدارة العروض',
        items: [
          {
            label: 'الحملات',
            icons: 'fa-solid fa-bullhorn',
            submenu: [
              {
                key: 'حملة اساسية',
                path: 'Campaigns/list-basicCampaign',
                icon: 'fa-solid fa-check-circle',
              },
              {
                key: 'حملة اكل',
                path: 'Campaigns/list-foodCampaign',
                icon: 'fa-solid fa-circle-xmark',
              },
            ],
          },
          {
            label: 'كوبونات',
            path: 'manageOffers/add-Coupons',
            icons: 'fa-solid fa-ticket',
          },
          {
            label: 'استرداد نقدي',
            path: 'manageOffers/add-Cashback',
            icons: 'fa-solid fa-money-bill-transfer',
          },
          {
            label: 'لافتات',
            path: 'manageOffers/add-Banner',
            icons: 'fa-solid fa-image',
          },
          {
            label: 'بانر ترويجي',
            path: 'manageOffers/add-PromotionalBanner',
            icons: 'fa-solid fa-rectangle-ad',
          },
          {
            label: 'إعلان',
            icons: 'fa-solid fa-bullseye',
            submenu: [
              {
                key: 'اعلان جديد',
                path: 'manageOffers/add-Ad',
                icon: 'fa-solid fa-dollar-sign',
              },
              {
                key: 'طلبات الاعلانات',
                path: 'manageOffers/requests-Ads',
                icon: 'fa-solid fa-bullseye',
              },
            ],
          },
          {
            label: 'إشعارات',
            path: 'manageOffers/Notifications',
            icons: 'fa-solid fa-bell',
          },
        ],
      },
      {
        title: 'مساعدة ودعم',
        items: [
          {
            label: 'محادثات',
            path: '/chat',
            icons: 'fa-solid fa-comments',
          },
          {
            label: 'رسائل التواصل',
            path: '/contact-messages',
            icons: 'fa-solid fa-envelope-open-text',
          },
        ],
      },
      {
        title: 'إدارة العملاء',
        items: [
          {
            label: 'العملاء',
            path: 'manageCustomers/Customers',
            icons: 'fa-solid fa-users',
          },
          {
            label: 'المحفظة',
            icons: 'fa-solid fa-wallet',
            submenu: [
              {
                key: 'بونص',
                path: 'manageCustomers/Wallet-bonus',
                icon: 'fa-solid fa-coins',
              },
              {
                key: 'المعاملات',
                path: 'manageCustomers/wallet-transactions',
                icon: 'fa-solid fa-arrow-right-arrow-left',
              },
            ],
          },
          {
            label: 'نقطة ولاء',
            icons: 'fa-solid fa-gift',
            submenu: [
              {
                key: 'تقرير',
                path: 'manageCustomers/CustomerPoints-report',
                icon: 'fa-solid fa-trophy',
              },
            ],
          },
          {
            label: 'قائمة الإيميلات المشتركة',
            path: 'manageCustomers/ListOfShared-emails',
            icons: 'fa-solid fa-envelope',
          },
        ],
      },
      {
        title: 'الإعدادات والمناطق',
        items: [
          {
            label: 'المحافظات والمناطق',
            path: 'locations',
            icons: 'fa-solid fa-map-marker-alt',
          },
          {
            label: 'مستخدمو التطبيق',
            path: 'appUsers',
            icons: 'fa-solid fa-user-shield',
          },
        ],
      },
      {
        title: 'إدارة الدليفري',
        items: [
          {
            label: 'إعداد أنواع العربيات',
            path: 'manageDelivery/Setting-CarTypes',
            icons: 'fa-solid fa-car-side',
          },
          {
            label: 'إعداد الشيفتات',
            path: 'manageDelivery/Shift-Setting',
            icons: 'fa-solid fa-clock',
          },
          {
            label: 'الدليفري',
            icons: 'fa-solid fa-motorcycle',
            submenu: [
              {
                key: 'طلب انضمام جديد',
                path: 'manageDelivery/RequestNew-delivery',
                icon: 'fa-solid fa-id-badge',
              },
              {
                key: 'تتبع التوصيل',
                path: 'manageDelivery/tracking',
                icon: 'fa-solid fa-route',
              },
            ],
          },
        ],
      },
      {
        title: 'إدارة الصرف',
        items: [
          {
            label: 'دفع المطعم',
            path: '/restaurant-payments',
            icons: 'fa-solid fa-building-wheat',
          },
          {
            label: 'دفع المندوب',
            path: '/driver-payments',
            icons: 'fa-solid fa-person-biking',
          },
        ],
      },
      {
        title: 'إدارة التقارير',
        items: [
          {
            label: 'تقرير المعاملات',
            path: '/transactions-report',
            icons: 'fa-solid fa-chart-line',
          },
          {
            label: 'تقرير المصروفات',
            path: '/expenses-report',
            icons: 'fa-solid fa-file-invoice-dollar',
          },
          {
            label: 'تقرير المدفوعات',
            icons: 'fa-solid fa-money-check-dollar',
            submenu: [
              {
                key: 'المطاعم',
                path: '/restaurant-payments-report',
                icon: 'fa-solid fa-store',
              },
              {
                key: 'المندوبين',
                path: '/driver-payments-report',
                icon: 'fa-solid fa-person-biking',
              },
            ],
          },
          {
            label: 'تقرير الأكل',
            path: '/food-report',
            icons: 'fa-solid fa-burger',
          },
          {
            label: 'تقرير الطلبات',
            icons: 'fa-solid fa-list',
            submenu: [
              {
                key: 'اليومية',
                path: '/daily-orders-report',
                icon: 'fa-solid fa-calendar-day',
              },
              {
                key: 'السنوية',
                path: '/yearly-orders-report',
                icon: 'fa-solid fa-calendar',
              },
            ],
          },
          {
            label: 'تقرير المطاعم',
            icons: 'fa-solid fa-store',
            submenu: [
              {
                key: 'التقييمات',
                path: '/restaurant-ratings',
                icon: 'fa-solid fa-star',
              },
              {
                key: 'الأداء',
                path: '/restaurant-performance',
                icon: 'fa-solid fa-chart-column',
              },
            ],
          },
          {
            label: 'تقرير العملاء',
            icons: 'fa-solid fa-users-gear',
            submenu: [
              {
                key: 'نشطين',
                path: '/active-customers',
                icon: 'fa-solid fa-user-check',
              },
              {
                key: 'غير نشطين',
                path: '/inactive-customers',
                icon: 'fa-solid fa-user-xmark',
              },
            ],
          },
        ],
      },
      {
        title: 'إدارة المعاملات',
        items: [
          {
            label: 'اجمع الكاش',
            path: '/collect-cash',
            icons: 'fa-solid fa-hand-holding-dollar',
          },
          {
            label: 'سحوبات المطاعم',
            path: '/restaurant-withdrawals',
            icons: 'fa-solid fa-building-columns',
          },
          {
            label: 'مدفوعات المندوب',
            path: '/driver-payments',
            icons: 'fa-solid fa-money-bills',
          },
          {
            label: 'طريقة السحب',
            path: '/withdraw-methods',
            icons: 'fa-solid fa-money-check',
          },
        ],
      },
    ];
  }
}
