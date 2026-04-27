import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { allArea } from '../../../model/area.type';
import { RestaurantsService } from '../../../services/restaurants.service';
import { SettingAreasService } from '../../../services/setting-areas.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { MainCategoriesService } from '../../../../Categories/services/main-categories.service';
import {
  MultiSelectComponent,
  SelectItem,
} from '../../../../../shared/multi-select/multi-select.component';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  LocationPickerComponent,
  LocationChangePayload,
} from '../../../../../shared/components/location-picker/location-picker.component';

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    LocationPickerComponent,
  ],
  templateUrl: './add-restaurant.component.html',
  styleUrls: ['./add-restaurant.component.scss'],
})
export class AddRestaurantComponent implements OnInit, OnDestroy {
  private serviceIdSub?: Subscription;
  selectedLanguage: string = 'arabic';
  selectedLanguageLabel: string = 'Arabic - العربية (AR)';
  selectedLanguagePlaceholder: string = 'يرجى إدخال باللغة العربية';

  logoError: string | null = null;
  coverError: string | null = null;
  logoRequiredError: string | null = null;
  coverRequiredError: string | null = null;
  foodTypeError = false;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  LogoPreview: SafeUrl | null = null;
  CoverPreview: SafeUrl | null = null;
  Logo: File | null = null;
  Cover: File | null = null;

  areas: allArea[] = [];
  categories: SelectItem[] = [];
  selectedCategoryIds: number[] = [];
  isLoading: boolean = false;
  form!: FormGroup;

  services = [
    { id: 1, name: 'مطاعم' },
    { id: 2, name: 'تغذية' },
    { id: 3, name: 'متاجر' },
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private apiService: RestaurantsService,
    private areaService: SettingAreasService,
    private categoriesService: MainCategoriesService,
    private fb: FormBuilder,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAreas();
    this.serviceIdSub = this.form
      .get('serviceId')!
      .valueChanges.subscribe((id) => {
        if (id) this.loadCategories(id);
      });
  }

  ngOnDestroy(): void {
    this.serviceIdSub?.unsubscribe();
  }

  initForm() {
    this.form = this.fb.group({
      nameAr: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[\u0600-\u06FF\s]+$/),
        ],
      ],
      nameEn: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[A-Za-z\s]+$/),
        ],
      ],
      addressAr: ['', Validators.required],
      addressEn: ['', Validators.required],
      serviceId: [null, Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      areaId: [null, Validators.required],
      taxPercentage: [0, [Validators.required, Validators.min(0)]],
      minDeliveryTime: [15, [Validators.required, Validators.min(0)]],
      maxDeliveryTime: [45, [Validators.required, Validators.min(0)]],
      FirstName: ['', [Validators.required, Validators.minLength(2)]],
      LastName: ['', [Validators.required, Validators.minLength(2)]],
      PhoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{10,15}$/)],
      ],
      notes: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      resturantStatus: ['Active'],
    });
  }

  loadAreas(): void {
    this.areaService.getAllArea().subscribe({
      next: (data) => (this.areas = data),
      error: (err) => console.error('Error loading areas:', err),
    });
  }

  loadCategories(serviceId: number): void {
    this.categoriesService.getAllCategories(serviceId).subscribe({
      next: (res) => {
        this.categories = res.Categories.map((c) => ({
          id: c.id,
          name: c.name,
        }));
        this.selectedCategoryIds = [];
      },
      error: () => this.toast.error('فشل تحميل أنواع الأكل'),
    });
  }

  onCategorySelectionChange(ids: number[]): void {
    this.selectedCategoryIds = ids;
    this.foodTypeError = false;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  selectLanguage(language: string): void {
    this.selectedLanguage = language;
    this.selectedLanguageLabel = this.getLanguageLabel(language);
    this.selectedLanguagePlaceholder = this.getLanguagePlaceholder(language);
  }

  private getLanguageLabel(language: string): string {
    switch (language) {
      case 'english':
        return 'English (EN)';
      case 'arabic':
        return 'Arabic - العربية (AR)';
      default:
        return 'Arabic - العربية (AR)';
    }
  }

  private getLanguagePlaceholder(language: string): string {
    switch (language) {
      case 'english':
        return 'Please enter in English';
      case 'arabic':
        return 'يرجى إدخال باللغة العربية';
      default:
        return 'يرجى إدخال باللغة العربية';
    }
  }

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
      } else {
        this.CoverPreview = this.sanitizer.bypassSecurityTrustUrl(previewUrl);
        this.Cover = file;
      }
    };
    reader.readAsDataURL(file); // ← هنا السر: Data URL للمعاينة الفورية
  }

  clearImage(type: 'logo' | 'cover'): void {
    if (type === 'logo') {
      this.LogoPreview = null;
      this.Logo = null;
    } else {
      this.CoverPreview = null;
      this.Cover = null;
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

  handleSubmit(): void {
    this.form.markAllAsTouched();
    this.foodTypeError = this.selectedCategoryIds.length === 0;

    if (
      this.form.invalid ||
      !this.Logo ||
      !this.Cover ||
      this.foodTypeError ||
      this.form.value.password !== this.form.value.confirmPassword
    ) {
      this.toast.error('يرجى تصحيح جميع الأخطاء');
      return;
    }

    const formValue = this.form.value;
    const formData = new FormData();

    formData.append('NameAr', formValue.nameAr.trim());
    formData.append('NameEn', formValue.nameEn.trim());
    formData.append('AddressAr', formValue.addressAr.trim());
    formData.append('AddressEn', formValue.addressEn.trim());
    formData.append('ServiceId', formValue.serviceId);
    formData.append('Latitude', formValue.latitude);
    formData.append('Longitude', formValue.longitude);
    formData.append('AreaId', formValue.areaId);
    formData.append('TaxPercentage', formValue.taxPercentage);
    formData.append('MinDeliveryTime', formValue.minDeliveryTime);
    formData.append('MaxDeliveryTime', formValue.maxDeliveryTime);
    formData.append('FirstName', formValue.FirstName);
    formData.append('LastName', formValue.LastName);
    formData.append('PhoneNumber', formValue.PhoneNumber);
    formData.append('Notes', formValue.notes || '');
    formData.append('Email', formValue.email);
    formData.append('Password', formValue.password);
    formData.append('ConfirmPassword', formValue.confirmPassword);
    formData.append('ResturantStatus', formValue.resturantStatus);

    // إرسال الكاتجوريز كـ array of strings
    this.selectedCategoryIds.forEach((id) =>
      formData.append('CategoryIds', String(id)),
    );

    if (this.Logo) formData.append('Logo', this.Logo);
    if (this.Cover) formData.append('Cover', this.Cover);

    this.isLoading = true;

    this.apiService.addRestaurant(formData).subscribe({
      next: () => {
        this.toast.success('تم إضافة المطعم بنجاح');
        this.isLoading = false;
        this.resetForm();
      },
      error: (err) => {
        this.toast.error(err.error?.title || 'حدث خطأ أثناء الإضافة');
        this.isLoading = false;
      },
    });
  }

  resetForm() {
    this.form.reset();
    this.Logo = null;
    this.Cover = null;
    this.LogoPreview = null;
    this.CoverPreview = null;
    this.selectedCategoryIds = [];
    this.foodTypeError = false;
  }

  onLocationChange(data: LocationChangePayload) {
    this.form.patchValue({
      latitude: data.lat,
      longitude: data.lng,
      addressAr: data.addressAr,
      addressEn: data.addressEn,
    });
  }
}
