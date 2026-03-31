import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { allArea } from '../../../model/area.type'; // من types
import { RestaurantsService } from '../../../services/restaurants.service';
import { SettingAreasService } from '../../../services/setting-areas.service';

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // نموذج البيانات
  nameAr: string = '';
  nameEn: string = '';
  addressAr: string = '';
  addressEn: string = '';
  serviceId: number | null = null;
  latitude: number | null = null;
  longitude: number | null = null;
  foodType: number | null = null;
  areaId: number | null = null;
  taxPercentage: number | null = null;
  minDeliveryTime: number | null = null;
  maxDeliveryTime: number | null = null;
  ownerFirstName: string = '';
  ownerLastName: string = '';
  ownerPhone: string = '';
  notes: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

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
  ) {}

  ngOnInit(): void {
    this.loadAreas();
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

  /*private setError(type: 'logo' | 'cover', msg: string): void {
    if (type === 'logo') this.logoError = msg;
    else this.coverError = msg;
  }

  private clearError(type: 'logo' | 'cover'): void {
    if (type === 'logo') this.logoError = null;
    else this.coverError = null;
  }*/

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

  handleSubmit(form: any): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.logoRequiredError = null;
    this.coverRequiredError = null;

    // التحقق من الصور إجباريًا
    if (!this.Logo) {
      this.logoRequiredError = 'الشعار مطلوب';
    }
    if (!this.Cover) {
      this.coverRequiredError = 'الغلاف مطلوب';
    }

    if (
      !form.valid ||
      this.logoError ||
      this.coverError ||
      !this.Logo ||
      !this.Cover ||
      this.password !== this.confirmPassword
    ) {
      this.errorMessage = 'يرجى تصحيح جميع الأخطاء الموجودة';
      return;
    }

    // إضافة قيم افتراضية إذا كانت فارغة
    const lat = this.latitude ?? Math.random() * 90 - 45;
    const lng = this.longitude ?? Math.random() * 180 - 90;

    const formData = new FormData();

    // إضافة الحقول النصية أولاً
    formData.append('NameAr', this.nameAr.trim());
    formData.append('NameEn', this.nameEn.trim());
    formData.append('AddressAr', this.addressAr.trim());
    formData.append('AddressEn', this.addressEn.trim());
    formData.append('ServiceId', this.serviceId?.toString() || '1');
    formData.append('Latitude', lat.toString());
    formData.append('Longitude', lng.toString());
    formData.append('FoodType', this.foodType?.toString() || '1');
    formData.append('AreaId', this.areaId?.toString() || '');
    formData.append('TaxPercentage', this.taxPercentage?.toString() || '0');
    formData.append(
      'MinDeliveryTime',
      this.minDeliveryTime?.toString() || '15',
    );
    formData.append(
      'MaxDeliveryTime',
      this.maxDeliveryTime?.toString() || '45',
    );
    formData.append('ResturantOwnerFirstName', this.ownerFirstName.trim());
    formData.append('ResturantOwnerLastName', this.ownerLastName.trim());
    formData.append('ResturantOwnerPhone', this.ownerPhone.trim());
    formData.append('Notes', this.notes.trim());
    formData.append('Email', this.email.trim());
    formData.append('Password', this.password);
    formData.append('ConfirmPassword', this.confirmPassword);

    // إضافة الملفات أخيرًا
    if (this.Logo) {
      formData.append('Logo', this.Logo, this.Logo.name);
    }
    if (this.Cover) {
      formData.append('Cover', this.Cover, this.Cover.name);
    }

    // طباعة للتحقق (افتح console)
    console.log('FormData contents:');
    for (const [key, value] of (formData as any).entries()) {
      console.log(key, value instanceof File ? `${value.name} (File)` : value);
    }

    this.isLoading = true;

    this.apiService.addRestaurant(formData).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'تم إضافة المطعم بنجاح';
        this.isLoading = false;
        setTimeout(() => this.resetForm(), 4000);
      },
      error: (err) => {
        console.error('خطأ في إضافة المطعم:', err);
        this.errorMessage =
          err.error?.errors?.Logo?.[0] ||
          err.error?.errors?.Cover?.[0] ||
          err.error?.title ||
          'حدث خطأ أثناء إضافة المطعم، حاول مرة أخرى';
        this.isLoading = false;
      },
    });
  }

  resetForm(): void {
    this.nameAr = '';
    this.nameEn = '';
    this.addressAr = '';
    this.addressEn = '';
    this.serviceId = null;
    this.latitude = null;
    this.longitude = null;
    this.foodType = null;
    this.areaId = null;
    this.taxPercentage = null;
    this.minDeliveryTime = null;
    this.maxDeliveryTime = null;
    this.ownerFirstName = '';
    this.ownerLastName = '';
    this.ownerPhone = '';
    this.notes = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.Logo = null;
    this.Cover = null;
    this.LogoPreview = null;
    this.CoverPreview = null;
    this.logoError = null;
    this.coverError = null;
    this.logoRequiredError = null;
    this.coverRequiredError = null;
    this.successMessage = null;
    this.errorMessage = null;

    // إعادة تعيين inputs الملفات
    const logoInput = document.getElementById('logoUpload') as HTMLInputElement;
    const coverInput = document.getElementById(
      'coverUpload',
    ) as HTMLInputElement;
    if (logoInput) logoInput.value = '';
    if (coverInput) coverInput.value = '';
  }
}
