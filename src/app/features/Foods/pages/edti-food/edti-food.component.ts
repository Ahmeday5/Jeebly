import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ProductsService } from '../../services/list-food.service';
import { RestaurantsService } from '../../../manageRestaurants/services/restaurants.service';
import { FilteredRestaurant } from '../../../manageRestaurants/model/restaurant.type';
import { RestaurantCategory } from '../../model/food.type';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-edti-food',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edti-food.component.html',
  styleUrl: './edti-food.component.scss',
})
export class EdtiFoodComponent implements OnInit {
  form!: FormGroup;
  productId!: number;
  selectedLanguage = 'arabic';
  private readonly baseUrl = environment.apiBaseUrl;

  ImagePreview: SafeUrl | string | null = null;
  ImageFile: File | null = null;

  restaurants: FilteredRestaurant[] = [];
  categories: RestaurantCategory[] = [];
  isLoading = false;
  isSaving = false;

  services = [
    { id: 1, name: 'مطاعم' },
    { id: 2, name: 'تغذية' },
    { id: 3, name: 'متاجر' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private productsService: ProductsService,
    private restaurantsService: RestaurantsService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadRestaurants();
    this.loadProduct();

    this.form.get('ResturantId')!.valueChanges.subscribe((id) => {
      if (id) this.loadCategoriesByRestaurant(id);
      else this.categories = [];
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      ServiceId:     [1, Validators.required],
      ResturantId:   [null, Validators.required],
      CategoryId:    [null, Validators.required],
      NameAr:        ['', [Validators.required, Validators.minLength(2)]],
      NameEn:        ['', [Validators.required, Validators.minLength(2)]],
      DescriptionAr: ['', Validators.required],
      DescriptionEn: ['', Validators.required],
      Price:         [null, [Validators.required, Validators.min(0)]],
      Quantity:      [1,  [Validators.required, Validators.min(0)]],
      IsActive:      [true],
      Lang:          ['1'],
    });
  }

  loadProduct(): void {
    this.isLoading = true;
    this.productsService.getProductById(this.productId).subscribe({
      next: (product) => {
        const restaurantId = (product as any).restaurantId ?? (product as any).resturantId ?? null;
        this.form.patchValue({
          ResturantId:   restaurantId,
          CategoryId:    product.categoryId,
          NameAr:        product.nameAr,
          NameEn:        product.nameEn,
          DescriptionAr: product.descriptionAr,
          DescriptionEn: product.descriptionEn,
          Price:         product.price,
          IsActive:      product.isActive,
          Lang:          product.lang ?? '1',
        });
        if (product.imageUrl) {
          this.ImagePreview = `${this.baseUrl}${product.imageUrl}`;
        }
        if (restaurantId) {
          this.loadCategoriesByRestaurant(restaurantId);
        }
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('فشل تحميل بيانات المنتج');
        this.isLoading = false;
      },
    });
  }

  loadRestaurants(): void {
    const loadPage = (page: number, acc: FilteredRestaurant[] = []) => {
      this.restaurantsService.getFilteredRestaurants('', '', page, 50).subscribe({
        next: (res) => {
          acc.push(...res.restaurants);
          if (page < res.totalPages) loadPage(page + 1, acc);
          else this.restaurants = acc;
        },
        error: () => {},
      });
    };
    loadPage(1);
  }

  loadCategoriesByRestaurant(restaurantId: number): void {
    this.productsService.getCategoriesByRestaurant(restaurantId).subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: () => this.toast.error('فشل تحميل الفئات'),
    });
  }

  selectLanguage(lang: string): void {
    this.selectedLanguage = lang;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      this.toast.warning('الصيغة غير مدعومة. استخدم jpg أو png');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.warning('حجم الصورة كبير جدًا (الحد الأقصى 5 ميجا)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.ImagePreview = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
    };
    reader.readAsDataURL(file);
    this.ImageFile = file;
  }

  removeImage(): void {
    this.ImagePreview = null;
    this.ImageFile = null;
    const input = document.getElementById('imageUpload') as HTMLInputElement;
    if (input) input.value = '';
  }

  handleSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.error('يرجى تصحيح جميع الأخطاء');
      return;
    }

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
    if (this.ImageFile) fd.append('ImageUrl', this.ImageFile);

    this.isSaving = true;
    this.productsService.updateProduct(this.productId, fd).subscribe({
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

  goBack(): void {
    this.router.navigate(['/Foods/list-food']);
  }
}
