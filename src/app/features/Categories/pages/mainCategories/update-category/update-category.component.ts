import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MainCategoriesService } from '../../../services/main-categories.service';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-update-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-category.component.html',
  styleUrl: './update-category.component.scss',
})
export class UpdateCategoryComponent implements OnInit {
  form!: FormGroup;
  categoryId!: number;
  selectedLanguage: string = 'arabic';

  LogoPreview: SafeUrl | string | null = null;
  Logo: File | null = null;
  isLoading = false;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private apiService: MainCategoriesService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadCategory();
  }

  initForm() {
    this.form = this.fb.group({
      NameAr: ['', [Validators.required, Validators.minLength(2)]],
      NameEn: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  loadCategory() {
    this.isLoading = true;
    this.apiService.getCategoryById(this.categoryId).subscribe({
      next: (res) => {
        const data = res.data;
        this.form.patchValue({
          NameAr: data.nameAr ?? data.name ?? '',
          NameEn: data.nameEn ?? '',
        });
        if (data.image) {
          this.LogoPreview = data.image;
        }
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('فشل تحميل بيانات الفئة');
        this.isLoading = false;
      },
    });
  }

  selectLanguage(lang: string) {
    this.selectedLanguage = lang;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

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
      this.LogoPreview = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
    };
    reader.readAsDataURL(file);
    this.Logo = file;
  }

  removeImage(): void {
    this.LogoPreview = null;
    this.Logo = null;
    const input = document.getElementById('logoUpload') as HTMLInputElement;
    if (input) input.value = '';
  }

  handleSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.error('يرجى إدخال كل البيانات المطلوبة');
      return;
    }

    const formData = new FormData();
    formData.append('Id', String(this.categoryId));
    formData.append('NameAr', this.form.value.NameAr.trim());
    formData.append('NameEn', this.form.value.NameEn.trim());
    if (this.Logo) {
      formData.append('Image', this.Logo);
    }

    this.isSaving = true;
    this.apiService.updateCategory(formData).subscribe({
      next: () => {
        this.toast.success('تم تحديث الفئة بنجاح');
        this.router.navigate(['Categories/add-list-category']);
      },
      error: () => {
        this.toast.error('فشل تحديث الفئة');
        this.isSaving = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['Categories/add-list-category']);
  }
}
