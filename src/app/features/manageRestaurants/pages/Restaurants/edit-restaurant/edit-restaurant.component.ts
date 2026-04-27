import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { allArea } from '../../../model/area.type';
import { environment } from '../../../../../../environments/environment';
import { RestaurantsService } from '../../../services/restaurants.service';
import { SettingAreasService } from '../../../services/setting-areas.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { MainCategoriesService } from '../../../../Categories/services/main-categories.service';
import { MultiSelectComponent, SelectItem } from '../../../../../shared/multi-select/multi-select.component';
import {
  LocationPickerComponent,
  LocationChangePayload,
} from '../../../../../shared/components/location-picker/location-picker.component';

@Component({
  selector: 'app-edit-restaurant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    LocationPickerComponent,
  ],
  templateUrl: './edit-restaurant.component.html',
  styleUrls: ['./edit-restaurant.component.scss'],
})
export class EditRestaurantComponent implements OnInit, OnDestroy {
  private serviceIdSub?: Subscription;
  //url
  private readonly baseUrl: string = environment.apiBaseUrl;
  selectedLanguage: string = 'arabic';
  selectedLanguageLabel: string = 'Arabic - العربية (AR)';
  selectedLanguagePlaceholder: string = 'يرجى إدخال باللغة العربية';
  isLoading: boolean = false;
  Loading: boolean = false;
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
  categories: SelectItem[] = [];
  selectedCategoryIds: number[] = [];
  foodTypeError = false;

  // بيانات النموذج
  form!: FormGroup;
  currentEditingRestaurantId: number | null = null;

  // لإعادة التعيين (reset)
  originalLogoPreview: SafeUrl | null = null;
  originalCoverPreview: SafeUrl | null = null;

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
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    // جلب الـ ID من الـ URL
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.currentEditingRestaurantId = id;
        this.loadRestaurant(id);
      } else {
        this.toast.error('معرف المطعم غير صالح');
        setTimeout(
          () => this.router.navigate(['/manageRestaurants/list-restaurants']),
          2000,
        );
      }
    } else {
      this.toast.error('لم يتم تحديد منطقة للتعديل');
      setTimeout(
        () => this.router.navigate(['/manageRestaurants/list-restaurants']),
        2000,
      );
    }
    this.loadAreas();
    this.initForm();
    this.serviceIdSub = this.form.get('serviceId')!.valueChanges.subscribe((id) => {
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
      ownerFirstName: ['', [Validators.required, Validators.minLength(2)]],
      ownerLastName: ['', [Validators.required, Validators.minLength(2)]],
      ownerPhone: [
        '',
        [Validators.required, Validators.pattern(/^\d{10,15}$/)],
      ],
      notes: [''],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  loadCategories(serviceId: number, namesToSelect?: string[]): void {
    this.categoriesService.getAllCategories(serviceId).subscribe({
      next: (res) => {
        this.categories = res.Categories.map((c) => ({ id: c.id, name: c.name }));
        if (namesToSelect?.length) {
          this.selectedCategoryIds = this.categories
            .filter((c) => namesToSelect.includes(c.name))
            .map((c) => c.id);
        } else {
          this.selectedCategoryIds = [];
        }
      },
      error: () => this.toast.error('فشل تحميل أنواع الأكل'),
    });
  }
  
  onCategorySelectionChange(ids: number[]): void {
    this.selectedCategoryIds = ids;
    this.foodTypeError = false;
  }

  loadRestaurant(id: number): void {
    this.Loading = true;
    forkJoin({
      details: this.apiService.getRestaurantById(id),
      withCategories: this.apiService.getRestaurantForEdit(id),
    }).subscribe({
      next: ({ details, withCategories }) => {
        this.form.patchValue({
          nameAr: details.nameAr || '',
          nameEn: details.nameEn || '',
          addressAr: details.addressAr || '',
          addressEn: details.addressEn || '',
          serviceId: details.serviceId,
          latitude: details.latitude,
          longitude: details.longitude,
          areaId: details.areaId,
          taxPercentage: details.taxPercentage,
          minDeliveryTime: details.minDeliveryTime,
          maxDeliveryTime: details.maxDeliveryTime,
          ownerFirstName: details.ownerFirstName || '',
          ownerLastName: details.ownerLastName || '',
          ownerPhone: details.ownerPhone || '',
          notes: details.notes || '',
          email: details.ownerEmail || '',
        }, { emitEvent: false });

        const categoryNames: string[] = withCategories.categoryName || [];
        if (details.serviceId) {
          this.loadCategories(details.serviceId, categoryNames);
        }

        if (details.logo) {
          const fullLogoUrl = `${this.baseUrl}${details.logo}`;
          this.LogoPreview = this.sanitizer.bypassSecurityTrustUrl(fullLogoUrl);
          this.originalLogoPreview = this.LogoPreview;
        }
        if (details.coverUrl) {
          const fullCoverUrl = `${this.baseUrl}${details.coverUrl}`;
          this.CoverPreview = this.sanitizer.bypassSecurityTrustUrl(fullCoverUrl);
          this.originalCoverPreview = this.CoverPreview;
        }
        this.Loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error('فشل جلب بيانات المطعم');
        console.error('Error loading restaurant:', err);
        this.Loading = false;
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

    if (this.form.invalid || this.foodTypeError) {
      this.toast.error('يرجى تصحيح جميع الأخطاء');
      return;
    }

    const formData = new FormData();
    const value = this.form.value;
    formData.append('Id', this.currentEditingRestaurantId?.toString() || '');
    formData.append('NameAr', value.nameAr);
    formData.append('NameEn', value.nameEn);
    formData.append('AddressAr', value.addressAr);
    formData.append('AddressEn', value.addressEn);
    formData.append('ServiceId', value.serviceId?.toString() || '');
    formData.append('Latitude', value.latitude?.toString() || '');
    formData.append('Longitude', value.longitude?.toString() || '');
    formData.append('AreaId', value.areaId?.toString() || '');
    formData.append('TaxPercentage', value.taxPercentage?.toString() || '');
    formData.append('MinDeliveryTime', value.minDeliveryTime?.toString() || '');
    formData.append('MaxDeliveryTime', value.maxDeliveryTime?.toString() || '');
    formData.append('ResturantOwnerFirstName', value.ownerFirstName);
    formData.append('ResturantOwnerLastName', value.ownerLastName);
    formData.append('ResturantOwnerPhone', value.ownerPhone);
    formData.append('Notes', value.notes || '');
    formData.append('Email', value.email);

    // إرسال الكاتجوريز كـ array of strings
    this.selectedCategoryIds.forEach((id) =>
      formData.append('CategoryIds', String(id))
    );

    if (this.Logo) formData.append('Logo', this.Logo);
    if (this.Cover) formData.append('Cover', this.Cover);

    this.isLoading = true;
    this.apiService.updateRestaurant(formData).subscribe({
      next: () => {
        this.toast.success('تم تعديل المطعم بنجاح');
        this.isLoading = false;
        setTimeout(() => {
          this.form.reset();
          this.router.navigate(['/manageRestaurants/list-restaurants']);
        }, 1500);
      },
      error: (err) => {
        this.toast.error(err.message || 'فشل تعديل المطعم');
        this.isLoading = false;
      },
    });
  }

  resetForm() {
    this.form.reset();
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
