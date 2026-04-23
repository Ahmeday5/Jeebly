import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { ProductsService } from '../../services/list-food.service';
import { RestaurantCategory, serviceRestaurant } from '../../model/food.type';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../../environments/environment';

const SERVICES = [
  { id: 1, name: 'مطاعم' },
  { id: 2, name: 'تغذية' },
  { id: 3, name: 'متاجر' },
] as const;

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_IMAGE_SIZE_MB = 5 * 1024 * 1024;

@Component({
  selector: 'app-edti-food',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edti-food.component.html',
  styleUrl: './edti-food.component.scss',
})
export class EdtiFoodComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  productId!: number;
  selectedLanguage = 'arabic';
  imagePreview: SafeUrl | string | null = null;
  imageFile: File | null = null;
  restaurants: serviceRestaurant[] = [];
  categories: RestaurantCategory[] = [];
  isLoading = false;
  isSaving = false;

  readonly services = SERVICES;
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly destroy$ = new Subject<void>();
  private isInitializing = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private productsService: ProductsService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.setupCascadeListeners();
    this.loadProduct();
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
      Price:         [null, [Validators.required, Validators.min(0)]],
      Quantity:      [1,   [Validators.required, Validators.min(0)]],
      IsActive:      [true],
      Lang:          ['1'],
    });
  }

  private setupCascadeListeners(): void {
    this.form.get('ServiceId')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        if (this.isInitializing) return;
        this.restaurants = [];
        this.categories = [];
        this.form.patchValue({ ResturantId: null, CategoryId: null }, { emitEvent: false });
        if (id) this.loadRestaurantsByService(id);
      });

    this.form.get('ResturantId')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        if (this.isInitializing) return;
        this.categories = [];
        this.form.patchValue({ CategoryId: null }, { emitEvent: false });
        if (id) this.loadCategoriesByRestaurant(id);
      });
  }

  private loadProduct(): void {
    this.isLoading = true;
    this.isInitializing = true;

    this.productsService.getProductById(this.productId).subscribe({
      next: (product) => {
        const serviceId = product.serviceId ?? 1;
        const restaurantId = product.restaurantId ?? null;

        this.form.patchValue({
          ServiceId:     serviceId,
          ResturantId:   restaurantId,
          CategoryId:    product.categoryId,
          NameAr:        product.nameAr,
          NameEn:        product.nameEn,
          DescriptionAr: product.descriptionAr,
          DescriptionEn: product.descriptionEn,
          Price:         product.price,
          Quantity:      product.quantity,
          IsActive:      product.isActive,
          Lang:          product.lang ?? '1',
        });

        if (product.imageUrl) this.imagePreview = `${this.baseUrl}${product.imageUrl}`;
        if (serviceId) this.loadRestaurantsByService(serviceId);
        if (restaurantId) this.loadCategoriesByRestaurant(restaurantId);

        this.isLoading = false;
        this.isInitializing = false;
      },
      error: () => {
        this.toast.error('فشل تحميل بيانات المنتج');
        this.isLoading = false;
        this.isInitializing = false;
      },
    });
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
    if (this.form.invalid) {
      this.toast.error('يرجى تصحيح جميع الأخطاء');
      return;
    }

    this.isSaving = true;
    this.productsService.updateProduct(this.productId, this.buildFormData()).subscribe({
      next: () => {
        this.toast.success('تم تحديث المنتج بنجاح');
        this.isSaving = false;
        this.router.navigate(['/Foods/list-food']);
      },
      error: (err) => {
        this.toast.error(err.message || 'فشل تحديث المنتج');
        this.isSaving = false;
      },
    });
  }

  private buildFormData(): FormData {
    const v = this.form.value;
    const fd = new FormData();
    fd.append('ServiceId',     String(v.ServiceId));
    fd.append('ResturantId',   String(v.ResturantId ?? ''));
    fd.append('CategoryId',    String(v.CategoryId));
    fd.append('NameAr',        v.NameAr.trim());
    fd.append('NameEn',        v.NameEn.trim());
    fd.append('DescriptionAr', v.DescriptionAr.trim());
    fd.append('DescriptionEn', v.DescriptionEn.trim());
    fd.append('Price',         String(v.Price));
    fd.append('Quantity',      String(v.Quantity));
    fd.append('IsActive',      v.IsActive ? 'true' : 'false');
    fd.append('Lang',          v.Lang ?? '1');
    if (this.imageFile) fd.append('ImageUrl', this.imageFile);
    return fd;
  }

  goBack(): void {
    this.router.navigate(['/Foods/list-food']);
  }
}
