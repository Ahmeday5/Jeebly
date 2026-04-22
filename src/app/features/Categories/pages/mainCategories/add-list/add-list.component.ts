import { CommonModule } from '@angular/common';
import { environment } from '../../../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MainCategoriesService } from '../../../services/main-categories.service';
import { MainCategory } from '../../../model/categories.type';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FilteredRestaurant } from '../../../../manageRestaurants/model/restaurant.type';
import { RestaurantsService } from '../../../../manageRestaurants/services/restaurants.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../core/services/confirm.service';

@Component({
  selector: 'app-add-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-list.component.html',
  styleUrl: './add-list.component.scss',
})
export class AddListComponent implements OnInit {
  readonly baseUrl = environment.apiBaseUrl;
  selectedLanguage: string = 'arabic'; //تتبع اللغة المختارة
  selectedLanguageLabel: string = 'عربية';
  selectedLanguageePlaceholder: string = 'يرجي ادخال لغة عربية';

  logoError: string | null = null;
  coverError: string | null = null;
  logoRequiredError: string | null = null;
  coverRequiredError: string | null = null;

  LogoPreview: SafeUrl | null = null;
  Logo: File | null = null;

  categories: MainCategory[] = [];
  isLoading: boolean = false;

  // نموذج البيانات
  form!: FormGroup;

  currentPage = 1;
  pageSize = 30; // نخليها كبيرة عشان نقلل عدد اللف
  totalPages = 1;

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
    private fb: FormBuilder,
    private toast: ToastService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.initForm();
  }

  initForm() {
    this.form = this.fb.group({
      ServiesId: [0, Validators.required],
      NameAr: ['', [Validators.required, Validators.minLength(2)]],
      NameEn: ['', [Validators.required, Validators.minLength(2)]],
    });
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
      this.toast.warning('الصيغة غير مدعومة. استخدم jpg أو png أو gif');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.warning('حجم الصورة كبير جدًا (الحد الأقصى 5 ميجا)');
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
    this.apiService.getAllCategories(this.selectedServiceId).subscribe({
      next: (res) => {
        this.categories = res.Categories;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('خطأ في جلب كل الفئات:', error);
        this.toast.error('فشل جلب الفئات');
        this.isLoading = false;
      },
    });
  }

  handleSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid || !this.Logo) {
      this.toast.error('يرجى إدخال كل البيانات');
      return;
    }

    const formValue = this.form.value;

    const formData = new FormData();

    formData.append('ServiesId', formValue.ServiesId);
    formData.append('NameAr', formValue.NameAr.trim());
    formData.append('NameEn', formValue.NameEn.trim());

    if (this.Logo) {
      formData.append('Image', this.Logo);
    }

    this.isLoading = true;

    this.apiService.addCategories(formData).subscribe({
      next: () => {
        this.toast.success('تم إضافة الفئة بنجاح');
        this.form.reset();
        this.Logo = null;
        this.LogoPreview = null;
        this.loadCategories();
        this.isLoading = false;
      },
      error: (err) => {
        this.toast.error(err.message || 'حدث خطأ أثناء الإضافة');
        this.isLoading = false;
      },
    });
  }

  deleteCategory(id: number) {
    this.confirm.confirm('هل أنت متأكد من حذف هذه الفئة؟ لا يمكن التراجع.', 'حذف الفئة').subscribe((ok) => {
      if (!ok) return;
      this.apiService.deleteCategory(id).subscribe({
        next: () => {
          this.toast.success('تم حذف الفئة بنجاح');
          this.loadCategories();
        },
        error: () => {
          this.toast.error('فشل حذف الفئة');
        },
      });
    });
  }

  editCategory(id: number) {
    this.router.navigate(['Categories/update-category', id]);
  }
}
