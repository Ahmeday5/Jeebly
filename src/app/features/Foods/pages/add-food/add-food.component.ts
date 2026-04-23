import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { ProductsService } from '../../services/list-food.service';
import { RestaurantCategory, serviceRestaurant } from '../../model/food.type';
import { ToastService } from '../../../../core/services/toast.service';

const SERVICES = [
  { id: 1, name: 'مطاعم' },
  { id: 2, name: 'تغذية' },
  { id: 3, name: 'متاجر' },
] as const;

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_IMAGE_SIZE_MB = 5 * 1024 * 1024;

@Component({
  selector: 'app-add-food',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-food.component.html',
  styleUrl: './add-food.component.scss',
})
export class AddFoodComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  selectedLanguage = 'arabic';
  imagePreview: SafeUrl | null = null;
  imageFile: File | null = null;
  restaurants: serviceRestaurant[] = [];
  categories: RestaurantCategory[] = [];
  isSaving = false;

  readonly services = SERVICES;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private productsService: ProductsService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupCascadeListeners();
    this.applyQueryParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasService(): boolean { return !!this.form.get('ServiceId')?.value; }
  get hasRestaurant(): boolean { return !!this.form.get('ResturantId')?.value; }

  private initForm(): void {
    this.form = this.fb.group({
      ServiceId:     [null, Validators.required],
      ResturantId:   [null, Validators.required],
      CategoryId:    [null, Validators.required],
      NameAr:        ['', [Validators.required, Validators.minLength(2)]],
      NameEn:        ['', [Validators.required, Validators.minLength(2)]],
      DescriptionAr: ['', Validators.required],
      DescriptionEn: ['', Validators.required],
      Price:         [null, [Validators.required, Validators.min(1)]],
      Quantity:      [null,   [Validators.required, Validators.min(1)]],
      IsActive:      [true],
      Lang:          ['1'],
    });
  }

  private setupCascadeListeners(): void {
    this.form.get('ServiceId')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.restaurants = [];
        this.categories = [];
        this.form.patchValue({ ResturantId: null, CategoryId: null }, { emitEvent: false });
        if (id) this.loadRestaurantsByService(id);
      });

    this.form.get('ResturantId')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.categories = [];
        this.form.patchValue({ CategoryId: null }, { emitEvent: false });
        if (id) this.loadCategoriesByRestaurant(id);
      });
  }

  private applyQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    const serviceId = params.get('serviceId');
    const restaurantId = params.get('restaurantId');

    if (serviceId) this.form.patchValue({ ServiceId: Number(serviceId) });
    if (restaurantId) this.form.patchValue({ ResturantId: Number(restaurantId) });
  }

  private loadRestaurantsByService(serviceId: number): void {
    this.productsService.getRestaurantByService(serviceId).subscribe({
      next: (restaurants) => (this.restaurants = restaurants),
      error: () => this.toast.error('فشل تحميل المطاعم'),
    });
  }

  private loadCategoriesByRestaurant(restaurantId: number): void {
    this.productsService.getCategoriesByRestaurant(restaurantId).subscribe({
      next: (cats) => (this.categories = cats),
      error: () => this.toast.error('فشل تحميل الفئات'),
    });
  }

  selectLanguage(lang: string): void {
    this.selectedLanguage = lang;
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      this.toast.warning('الصيغة غير مدعومة. استخدم jpg أو png');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB) {
      this.toast.warning('حجم الصورة كبير جدًا (الحد الأقصى 5 ميجا)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) =>
      (this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(e.target.result));
    reader.readAsDataURL(file);
    this.imageFile = file;
  }

  removeImage(): void {
    this.imagePreview = null;
    this.imageFile = null;
    const input = document.getElementById('imageUpload') as HTMLInputElement;
    if (input) input.value = '';
  }

  handleSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.imageFile) {
      this.toast.error(this.imageFile ? 'يرجى تصحيح جميع الأخطاء' : 'يرجى رفع صورة للمنتج');
      return;
    }

    this.isSaving = true;
    this.productsService.addProduct(this.buildFormData()).subscribe({
      next: () => {
        this.toast.success('تم إضافة المنتج بنجاح');
        this.isSaving = false;
        this.resetForm();
      },
      error: (err) => {
        this.toast.error(err.message || 'فشل إضافة المنتج');
        this.isSaving = false;
      },
    });
  }

  private buildFormData(): FormData {
    const v = this.form.value;
    const fd = new FormData();
    fd.append('ServiceId',     String(v.ServiceId));
    fd.append('ResturantId',   String(v.ResturantId));
    fd.append('CategoryId',    String(v.CategoryId));
    fd.append('NameAr',        v.NameAr.trim());
    fd.append('NameEn',        v.NameEn.trim());
    fd.append('DescriptionAr', v.DescriptionAr.trim());
    fd.append('DescriptionEn', v.DescriptionEn.trim());
    fd.append('Price',         String(v.Price));
    fd.append('Quantity',      String(v.Quantity));
    fd.append('IsActive',      v.IsActive ? 'true' : 'false');
    fd.append('Lang',          v.Lang ?? '1');
    fd.append('ImageUrl',      this.imageFile!);
    return fd;
  }

  private resetForm(): void {
    this.form.reset({ Quantity: 1, IsActive: true, Lang: '1' });
    this.imagePreview = null;
    this.imageFile = null;
    this.restaurants = [];
    this.categories = [];
  }

  goBack(): void {
    const restaurantId = this.route.snapshot.queryParamMap.get('restaurantId');
    this.router.navigate(
      restaurantId
        ? [`/manageRestaurants/details-restaurant/${restaurantId}/foods`]
        : ['/Foods/list-food'],
    );
  }
}
