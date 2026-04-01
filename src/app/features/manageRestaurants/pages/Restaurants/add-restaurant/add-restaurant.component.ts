import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { allArea } from '../../../model/area.type'; // من types
import { RestaurantsService } from '../../../services/restaurants.service';
import { SettingAreasService } from '../../../services/setting-areas.service';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-restaurant.component.html',
  styleUrls: ['./add-restaurant.component.scss'],
})
export class AddRestaurantComponent implements OnInit {
  selectedLanguage: string = 'arabic';
  selectedLanguageLabel: string = 'Arabic - العربية (AR)';
  selectedLanguagePlaceholder: string = 'يرجى إدخال باللغة العربية';

  logoError: string | null = null;
  coverError: string | null = null;
  logoRequiredError: string | null = null;
  coverRequiredError: string | null = null;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  LogoPreview: SafeUrl | null = null;
  CoverPreview: SafeUrl | null = null;
  Logo: File | null = null;
  Cover: File | null = null;

  areas: allArea[] = [];
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  form!: FormGroup;

  services = [
    { id: 1, name: 'مطاعم' },
    { id: 2, name: 'تغذية' },
    { id: 3, name: 'متاجر' },
  ];

  foodTypes = [{ id: 1, name: 'إيطالي' }];

  constructor(
    private sanitizer: DomSanitizer,
    private apiService: RestaurantsService,
    private areaService: SettingAreasService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAreas();
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
      foodType: [null, Validators.required],
      areaId: [null, Validators.required],
      taxPercentage: [0, [Validators.required, Validators.min(0)]],
      minDeliveryTime: [15, [Validators.required, Validators.min(0)]],
      maxDeliveryTime: [45, [Validators.required, Validators.min(0)]],
      ownerFirstName: ['', [Validators.required, Validators.minLength(2)]],
      ownerLastName: ['', [Validators.required, Validators.minLength(2)]],
      ownerPhone: [
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

    if (
      this.form.invalid ||
      !this.Logo ||
      !this.Cover ||
      this.form.value.password !== this.form.value.confirmPassword
    ) {
      this.errorMessage = 'يرجى تصحيح جميع الأخطاء';
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
    formData.append('FoodType', formValue.foodType);
    formData.append('AreaId', formValue.areaId);
    formData.append('TaxPercentage', formValue.taxPercentage);
    formData.append('MinDeliveryTime', formValue.minDeliveryTime);
    formData.append('MaxDeliveryTime', formValue.maxDeliveryTime);
    formData.append('ResturantOwnerFirstName', formValue.ownerFirstName);
    formData.append('ResturantOwnerLastName', formValue.ownerLastName);
    formData.append('ResturantOwnerPhone', formValue.ownerPhone);
    formData.append('Notes', formValue.notes || '');
    formData.append('Email', formValue.email);
    formData.append('Password', formValue.password);
    formData.append('ConfirmPassword', formValue.confirmPassword);
    formData.append('ResturantStatus', formValue.resturantStatus);

    if (this.Logo) formData.append('Logo', this.Logo);
    if (this.Cover) formData.append('Cover', this.Cover);

    this.isLoading = true;

    this.apiService.addRestaurant(formData).subscribe({
      next: (res) => {
        this.successMessage = 'تم إضافة المطعم بنجاح';
        this.isLoading = false;
        this.form.reset();
        setTimeout(() => {
          this.resetForm();
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.title || 'حدث خطأ';
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
    this.errorMessage = null;
    this.successMessage = null;
  }
}
