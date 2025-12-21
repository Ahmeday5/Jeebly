import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common'; // إضافة CommonModule
import {
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  Subscription,
} from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule], // إضافة RouterModule لدعم routerLink و routerLinkActive
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewInit {
  // حالة الـ Sidebar (مفتوحة أو مغلقة)
  isSidebarOpen: boolean = window.innerWidth > 992;

  menuItems: any[] = [];
  filteredMenuItems: any[] = [];
  private searchSub: Subscription | null = null;
  @ViewChild('searchInput', { static: true })
  searchInputRef!: ElementRef<HTMLInputElement>;

  // حقن Router و AuthService
  constructor(private router: Router) {}

  // التهيئة عند تحميل الكومبوننت
  ngOnInit(): void {
    this.updateMenuItems();
    // في البداية العرض يعرض القائمة كلها
    this.filteredMenuItems = JSON.parse(JSON.stringify(this.menuItems));
  }

  // بعد تحميل العرض
  ngAfterViewInit(): void {
    window.addEventListener('resize', () => {
      this.isSidebarOpen = window.innerWidth > 992;
    });

    // اشتراك على أحداث الإدخال مع debounce لتقليل النداءات أثناء الكتابة
    this.searchSub = fromEvent(this.searchInputRef.nativeElement, 'input')
      .pipe(
        map((e: any) => e.target.value as string),
        map((v) => v.trim()),
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe((query) => {
        this.applyFilter(query);
      });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  // فتح/قفل الـ Sidebar
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // التحقق إذا كان الرابط نشطًا
  isActive(path: string): boolean {
    return this.router.isActive(path, {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  // دالة لفتح/إغلاق القائمة الفرعية
  toggleSubmenu(sectionIndex: number, itemIndex: number): void {
    const section = this.filteredMenuItems[sectionIndex];
    if (!section || !section.items) return;
    const item = section.items[itemIndex];
    if (!item) return;
    item.isOpen = !item.isOpen;
  }

  /***********************
   * فلترة ذكية للـ menu *
   ***********************/
  private applyFilter(query: string): void {
    if (!query) {
      // لو البحث فاضي، رجع نسخة كاملة من الـ menu الأصلية (وأعد إغلاق القوائم الفرعية)
      this.filteredMenuItems = JSON.parse(JSON.stringify(this.menuItems));
      this.closeAllSubmenus(this.filteredMenuItems);
      return;
    }

    const q = query.toLowerCase();

    // ننتج قائمة جديدة تحتوي فقط الأقسام/عناصر التي تطابق الاستعلام
    const result: any[] = [];

    for (const section of this.menuItems) {
      const clonedSection: any = { ...section };
      // نحتاج نسخة مجمدة من items حتى لا نعدل المصدر الأصلي
      clonedSection.items = [];

      // نتحقق من عنوان القسم نفسه (title) أولاً
      const titleMatches =
        section.title && section.title.toLowerCase().includes(q);

      // لو العنوان يطابق، نعرض كل العناصر داخل هذا القسم
      if (titleMatches) {
        clonedSection.items = JSON.parse(JSON.stringify(section.items || []));
        // نفتح كل العناصر التي تحتوي submenu افتراضياً لكي تظهر النتائج بوضوح
        if (clonedSection.items)
          clonedSection.items.forEach((it: any) => {
            if (it.submenu) it.isOpen = true;
          });
        result.push(clonedSection);
        continue;
      }

      // وإلا نفلتر العناصر داخل القسم
      if (section.items && section.items.length) {
        for (const item of section.items) {
          const itemLabel = (item.label || '').toLowerCase();
          let matchedItem: any = null;

          // تطابق على اسم العنصر
          if (itemLabel.includes(q)) {
            matchedItem = JSON.parse(JSON.stringify(item));
            // لو هو عنصر يحتوي submenu، نفتحها تلقائياً
            if (matchedItem.submenu) matchedItem.isOpen = true;
          } else if (item.submenu && item.submenu.length) {
            // لو لم يطابق اسم العنصر، نبحث داخل الـ submenu
            const matchingSub: any[] = [];
            for (const sub of item.submenu) {
              const subKey = (sub.key || '').toLowerCase();
              if (subKey.includes(q)) {
                matchingSub.push(JSON.parse(JSON.stringify(sub)));
              }
            }
            if (matchingSub.length) {
              // نأخذ نسخة من العنصر ونضع فيها فقط الـ subitems المطابقة ونفتحه
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

        // لو وجدنا أي عنصر متطابق داخل القسم نضيف القسم
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
            path: '/dashboard',
            icons: 'fa-solid fa-gauge-high',
          },
        ],
      },
      {
        title: 'إدارة الطلبات',
        items: [
          {
            label: 'الطلبات',
            path: '/Orders',
            icons: 'fa-solid fa-list-check',
          },
          {
            label: 'طلبات الاشتراكات',
            path: '/subscription-requests',
            icons: 'fa-solid fa-receipt',
          },
          {
            label: 'إدارة التوصيل',
            icons: 'fa-solid fa-truck-fast',
            submenu: [
              {
                key: 'البحث عن دليفري',
                path: '/delivery-search',
                icon: 'fa-solid fa-id-card',
              },
              {
                key: 'طلبات شغالة',
                path: '/request-progress',
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
                path: '/order-return',
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
            path: '/setting-areas',
            icons: 'fa-solid fa-map',
          },
          {
            label: 'نوع الأكل',
            path: '/type-food',
            icons: 'fa-solid fa-utensils',
          },
          {
            label: 'مطاعم',
            icons: 'fa-solid fa-store',
            submenu: [
              {
                key: 'ضيف مطعم',
                path: '/add-restaurant',
                icon: 'fa-solid fa-burger',
              },
              {
                key: 'قائمة المطاعم',
                path: '/list-restaurants',
                icon: 'fa-solid fa-burger',
              },
              {
                key: 'طلب انضمام جديد',
                path: '/newJoin-Request',
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
                path: '/add-list-category',
                icon: 'fa-solid fa-tags',
              },
              {
                key: 'فئة فرعية',
                path: '/add-list-subcategory',
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
                path: '/add-food',
                icon: 'fa-solid fa-pizza-slice',
              },
              {
                key: 'قائمة الاكل',
                path: '/list-food',
                icon: 'fa-solid fa-carrot',
              },
              {
                key: 'تقييم',
                path: '/evaluation-food',
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
                path: '/list-basicCampaign',
                icon: 'fa-solid fa-check-circle',
              },
              {
                key: 'حملة اكل',
                path: '/list-foodCampaign',
                icon: 'fa-solid fa-circle-xmark',
              },
            ],
          },
          {
            label: 'كوبونات',
            path: '/add-Coupons',
            icons: 'fa-solid fa-ticket',
          },
          {
            label: 'استرداد نقدي',
            path: '/add-Cashback',
            icons: 'fa-solid fa-money-bill-transfer',
          },
          {
            label: 'لافتات',
            path: '/add-Banner',
            icons: 'fa-solid fa-image',
          },
          {
            label: 'بانر ترويجي',
            path: '/add-PromotionalBanner',
            icons: 'fa-solid fa-rectangle-ad',
          },
          {
            label: 'إعلان',
            icons: 'fa-solid fa-bullseye',
            submenu: [
              {
                key: 'اعلان جديد',
                path: '/add-Ad',
                icon: 'fa-solid fa-dollar-sign',
              },
              {
                key: 'طلبات الاعلانات',
                path: '/requests-Ads',
                icon: 'fa-solid fa-bullseye',
              },
            ],
          },
          {
            label: 'إشعارات',
            path: '/Notifications',
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
            path: '/Customers',
            icons: 'fa-solid fa-users',
          },
          {
            label: 'المحفظة',
            icons: 'fa-solid fa-wallet',
            submenu: [
              {
                key: 'بونص',
                path: '/Wallet-bonus',
                icon: 'fa-solid fa-coins',
              },
              {
                key: 'المعاملات',
                path: '/wallet-transactions',
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
                path: '/CustomerPoints-report',
                icon: 'fa-solid fa-trophy',
              },
            ],
          },
          {
            label: 'قائمة الإيميلات المشتركة',
            path: '/ListOfShared-emails',
            icons: 'fa-solid fa-envelope',
          },
        ],
      },
      {
        title: 'إدارة الدليفري',
        items: [
          {
            label: 'إعداد أنواع العربيات',
            path: '/Setting-CarTypes',
            icons: 'fa-solid fa-car-side',
          },
          {
            label: 'إعداد الشيفتات',
            path: '/Shift-Setting',
            icons: 'fa-solid fa-clock',
          },
          {
            label: 'الدليفري',
            icons: 'fa-solid fa-motorcycle',
            submenu: [
              {
                key: 'طلب انضمام جديد',
                path: '/RequestNew-delivery',
                icon: 'fa-solid fa-id-badge',
              },
              {
                key: 'تتبع التوصيل',
                path: '/tracking',
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
