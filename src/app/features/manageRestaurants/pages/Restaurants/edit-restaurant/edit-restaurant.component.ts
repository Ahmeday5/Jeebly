import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Restaurant } from '../../../model/restaurant.type';
import { allArea } from '../../../model/area.type';
import { environment } from '../../../../../../environments/environment';
import { RestaurantsService } from '../../../services/restaurants.service';
import { SettingAreasService } from '../../../services/setting-areas.service';

@Component({
  selector: 'app-edit-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-restaurant.component.html',
  styleUrls: ['./edit-restaurant.component.scss'],
})
export class EditRestaurantComponent implements OnInit {
  //url
  private readonly baseUrl: string = environment.apiBaseUrl;
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

  // الملفات الجديدة فقط (لو المستخدم رفع حاجة جديدة)
  newLogoFile: File | null = null;
  newCoverFile: File | null = null;

  areas: allArea[] = [];
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  restaurantId: number = 0;

  // بيانات النموذج
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

  // لإعادة التعيين (reset)
  originalLogoPreview: SafeUrl | null = null;
  originalCoverPreview: SafeUrl | null = null;

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
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.restaurantId = +this.route.snapshot.paramMap.get('id')!;
    this.loadAreas();
    this.loadRestaurant();
  }

  loadRestaurant(): void {
    this.apiService.getRestaurantById(this.restaurantId).subscribe({
      next: (data: Restaurant) => {
        this.nameAr = data.nameAr || '';
        this.nameEn = data.nameEn || '';
        this.addressAr = data.addressAr || '';
        this.addressEn = data.addressEn || '';
        this.serviceId = data.serviceId;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.foodType = data.foodType;
        this.areaId = data.areaId;
        this.taxPercentage = data.taxPercentage;
        this.minDeliveryTime = data.minDeliveryTime;
        this.maxDeliveryTime = data.maxDeliveryTime;
        this.ownerFirstName = data.ownerFirstName || '';
        this.ownerLastName = data.ownerLastName || '';
        this.ownerPhone = data.ownerPhone || '';
        this.notes = data.notes || '';
        this.email = data.ownerEmail || '';

        // عرض الصور القديمة كـ preview
        if (data.logo) {
          const fullLogoUrl = `${this.baseUrl}${data.logo}`;
          this.LogoPreview = this.sanitizer.bypassSecurityTrustUrl(fullLogoUrl);
          this.originalLogoPreview = this.LogoPreview;
        }
        if (data.coverUrl) {
          const fullCoverUrl = `${this.baseUrl}${data.coverUrl}`;
          this.CoverPreview =
            this.sanitizer.bypassSecurityTrustUrl(fullCoverUrl);
          this.originalCoverPreview = this.CoverPreview;
        }
      },
      error: (err) => {
        this.errorMessage = 'فشل جلب بيانات المطعم';
        console.error('Error loading restaurant:', err);
      },
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

    const formData = new FormData();
    formData.append('Id', this.restaurantId.toString());
    formData.append('NameAr', this.nameAr);
    formData.append('NameEn', this.nameEn);
    formData.append('AddressAr', this.addressAr);
    formData.append('AddressEn', this.addressEn);
    formData.append('ServiceId', this.serviceId?.toString() || '');
    formData.append('Latitude', this.latitude?.toString() || '');
    formData.append('Longitude', this.longitude?.toString() || '');
    formData.append('FoodType', this.foodType?.toString() || '');
    formData.append('AreaId', this.areaId?.toString() || '');
    formData.append('TaxPercentage', this.taxPercentage?.toString() || '');
    formData.append('MinDeliveryTime', this.minDeliveryTime?.toString() || '');
    formData.append('MaxDeliveryTime', this.maxDeliveryTime?.toString() || '');
    formData.append('ResturantOwnerFirstName', this.ownerFirstName);
    formData.append('ResturantOwnerLastName', this.ownerLastName);
    formData.append('ResturantOwnerPhone', this.ownerPhone);
    formData.append('Notes', this.notes);
    formData.append('Email', this.email);

    if (this.password) {
      formData.append('Password', this.password);
      formData.append('ConfirmPassword', this.confirmPassword);
    }

    // إذا رفع المستخدم صور جديدة → ابعتها
    // إذا ما رفعش → الـ backend هيحتفظ بالقديمة (مش بنبعت حقل فاضي)
    if (this.newLogoFile) {
      formData.append('Logo', this.newLogoFile);
    }
    if (this.newCoverFile) {
      formData.append('Cover', this.newCoverFile);
    }

    this.isLoading = true;
    this.apiService.updateRestaurant(formData).subscribe({
      next: (res) => {
        this.successMessage ='تم تعديل المطعم بنجاح';
        this.isLoading = false;
        setTimeout(() => (this.successMessage = null), 2000);
        setTimeout(() => (this.errorMessage = null), 2000);
      },
      error: (err) => {
        this.errorMessage = err.message || 'فشل تعديل المطعم';
        this.isLoading = false;
      },
    });
  }

  resetForm(): void {
    this.loadRestaurant(); // إعادة تحميل البيانات الأصلية + الصور القديمة
    this.password = '';
    this.confirmPassword = '';
    this.newLogoFile = null;
    this.newCoverFile = null;
    this.logoError = null;
    this.coverError = null;
    this.successMessage = null;
    this.errorMessage = null;
    this.logoRequiredError = null;
    this.coverRequiredError = null;
  }
}
