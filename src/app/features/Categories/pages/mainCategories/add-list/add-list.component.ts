import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MainCategoriesService } from '../../../services/main-categories.service';

@Component({
  selector: 'app-add-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-list.component.html',
  styleUrl: './add-list.component.scss',
})
export class AddListComponent implements OnInit {
  selectedLanguage: string = 'default'; //تتبع اللغة المختارة
  selectedLanguageLabel: string = 'افتراضي';
  selectedLanguageePlaceholder: string = 'يرجي ادخال لغة عربية';

  logoError: string | null = null;
  coverError: string | null = null;
  logoRequiredError: string | null = null;
  coverRequiredError: string | null = null;

  LogoPreview: SafeUrl | null = null;
  Logo: File | null = null;

  categories: any[] = [];
  isLoading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // نموذج البيانات
  RestaurantId: number | null = null;
  ServiesId: number | null = null;
  nameAr: string = '';
  nameEn: string = '';

  services = [
    { id: 1, name: 'مطاعم' },
    { id: 2, name: 'تغذية' },
    { id: 3, name: 'متاجر' },
  ];
  selectedServiceId: number = 1; // ← القيمة الافتراضية
  selectedServiceName: string = 'مطاعم'; // اختياري – للعرض فقط

  constructor(
    private apiService: MainCategoriesService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  // دالة لتحديث اللغة المختارة
  selectLanguage(language: string) {
    this.selectedLanguage = language;
    this.selectedLanguageLabel = this.getLanguageLabel(language);
    this.selectedLanguageePlaceholder = this.getLanguagePlaceholder(language);
  }

  private getLanguageLabel(language: string): string {
    switch (language) {
      case 'default':
        return 'افتراضي';
      case 'english':
        return 'English (EN)';
      case 'arabic':
        return 'Arabic - العربية (AR)';
      default:
        return 'افتراضي';
    }
  }

  private getLanguagePlaceholder(language: string): string {
    switch (language) {
      case 'default':
        return 'يرجي ادخال لغة عربية';
      case 'english':
        return 'يرجي ادخال لغة انجليزية';
      case 'arabic':
        return 'يرجي ادخال لغة عربية';
      default:
        return 'افتراضي';
    }
  }

  // التحقق من الملفات المرفوعة (شعار أو غلاف)
  onFileChange(event: Event, type: 'logo' | 'cover'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.clearImage(type);
      return;
    }

    const file = input.files[0];

    // فلترة بسيطة للصيغ والحجم (اختياري)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('الصيغة غير مدعومة. استخدم jpg أو png أو gif');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5 ميجا كحد أقصى مثال
      alert('حجم الصورة كبير جدًا (الحد الأقصى 5 ميجا)');
      return;
    }

    // إنشاء preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const previewUrl = e.target.result as string;

      if (type === 'logo') {
        this.LogoPreview = this.sanitizer.bypassSecurityTrustUrl(previewUrl);
        this.Logo = file;
      }
    };
    reader.readAsDataURL(file); // ← هنا السر: Data URL للمعاينة الفورية
  }

  clearImage(type: 'logo' | 'cover'): void {
    if (type === 'logo') {
      this.LogoPreview = null;
      this.Logo = null;
    }
  }

  removeImage(type: 'logo' | 'cover'): void {
    this.clearImage(type);
    // إعادة تعيين الـ input file
    const input = document.getElementById(
      type === 'logo' ? 'logoUpload' : 'coverUpload',
    ) as HTMLInputElement;
    if (input) input.value = '';
  }

  onServiceChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newId = Number(select.value);

    if (newId !== this.selectedServiceId) {
      this.selectedServiceId = newId;
      this.selectedServiceName =
        this.services.find((s) => s.id === newId)?.name || 'غير معروف';
      this.loadCategories();
    }
  }

  loadCategories() {
    this.isLoading = true;
    this.errorMessage = null;
    this.apiService.getAllCategories(this.selectedServiceId).subscribe({
      next: (data) => {
        this.categories = Array.isArray(data) ? data : [];
        if (this.categories.length === 0) {
          this.errorMessage = 'لا يوجد فئات متاحة';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('خطأ في جلب كل الفئات:', error);
        this.errorMessage = 'فشل جلب الفئات';
        this.isLoading = false;
      },
    });
  }

  editCategory() {
    this.router.navigate(['Categories/update-category']);
  }
}
