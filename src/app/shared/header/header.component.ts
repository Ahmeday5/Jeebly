import { Component, OnInit, OnDestroy } from '@angular/core'; // أضفت OnDestroy وHostListener
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { UserData } from '../../core/types/login.type';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})

export class HeaderComponent implements OnInit, OnDestroy {
  private headerElement: HTMLElement | null = null; // للـheader
  private headerIcons: NodeListOf<HTMLElement> | null = null; // عشان اجيب كل الديفات
  private headerTitle: HTMLElement | null = null;
  isOpen: boolean = false;
  // نستقبل القيم دي من الـ service
  displayName: string = 'Guest';
  userEmail: string | null = null;
  isLoggedIn: boolean = false;
  private subscriptions: Subscription[] = [];
  userData$: Observable<UserData | null>;

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService, // حقن AuthService لتسجيل الخروج
    private router: Router, // حقن Router للتعامل مع التنقل
    private activatedRoute: ActivatedRoute, // حقن ActivatedRoute للوصول للروت الحالي
  ) {
    this.userData$ = this.authService.userData$;
  }

  ngOnInit(): void {
    // اشتراك في تغييرات حالة اللوجن + الاسم + الإيميل
    this.subscriptions.push(
      this.authService.isLoggedIn$.subscribe((loggedIn) => {
        this.isLoggedIn = loggedIn;
      }),
    );

    this.subscriptions.push(
      this.authService.displayName$.subscribe((name) => {
        this.displayName = name;
      }),
    );

    this.subscriptions.push(
      this.authService.email$.subscribe((email) => {
        this.userEmail = email;
      }),
    );

    // تحميل القيم الحالية فورًا (لو الصفحة اتفتحت وهو مسجل دخول)
    this.isLoggedIn = this.authService.isLoggedInSubject.value;
    this.displayName = this.authService.displayName;
    this.userEmail = this.authService.email;
    this.headerElement = document.querySelector('.header'); // جلب الـheader
    this.headerIcons = document.querySelectorAll('.header .main-content .icon');
    this.headerTitle = document.querySelector('.header .main-content .title');
    // إضافة listener للسكرول (بدل HostListener عشان يشتغل في ngOnInit)
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    // إزالة الـlistener عشان ما يسببش مشاكل
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  logout(): void {
    this.authService.logout(); // استدعاء دالة logout من AuthService
    this.router.navigate(['/auth/login']); // التنقل إلى صفحة تسجيل الدخول
  }

  private onScroll(): void {
    if (this.headerElement && this.headerIcons && this.headerTitle) {
      if (window.scrollY > 50) {
        // عند سكرول أكتر من 50px
        this.headerElement.classList.add('scrolled');
        this.headerIcons.forEach((icon) => icon.classList.add('scrolled-icon')); // تطبيق على كل الـicons
        this.headerTitle.classList.add('scrolled-title');
      } else {
        this.headerElement.classList.remove('scrolled');
        this.headerIcons.forEach((icon) =>
          icon.classList.remove('scrolled-icon'),
        ); // إزالة من كل الـicons
        this.headerTitle.classList.remove('scrolled-title');
      }
    }
  }
}
