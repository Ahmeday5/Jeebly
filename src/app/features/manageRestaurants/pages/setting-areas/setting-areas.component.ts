import {
  Component,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { allArea } from '../../model/area.type';
import { SettingAreasService } from '../../services/setting-areas.service';
import { Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors } from '@angular/forms';

function bothLanguagesRequired(
  control: AbstractControl,
): ValidationErrors | null {
  const nameAr = control.get('nameAr')?.value;
  const nameEn = control.get('nameEn')?.value;

  if (!nameAr || !nameEn) {
    return { bothRequired: true };
  }

  return null;
}
@Component({
  selector: 'app-setting-areas',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './setting-areas.component.html',
  styleUrl: './setting-areas.component.scss',
})
export class SettingAreasComponent implements OnInit {
  selectedLanguage: string = 'arabic'; // نبدأ بالعربية كافتراضي
  showSettingsPage: boolean = true;
  showIncentiveForm: boolean = true;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  //table
  allAreas: allArea[] = [];
  Loading: boolean = false;
  form!: FormGroup;

  constructor(
    private apiService: SettingAreasService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAllArea();
  }
  
  initForm() {
    this.form = this.fb.group(
      {
        nameAr: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.pattern(/^[\u0600-\u06FF\s]+$/), // ✅ اتحلت
          ],
        ],
        nameEn: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.pattern(/^[A-Za-z\s]+$/), // ✅ اتحلت
          ],
        ],
        latitude: [0],
        longitude: [0],
        point3: [0],
      },
      { validators: bothLanguagesRequired },
    );
  }

  //ger all Area
  loadAllArea(): void {
    this.Loading = true;

    this.apiService.getAllArea().subscribe({
      next: (res) => {
        this.allAreas = res || [];
        console.error(this.allAreas);
        this.Loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading allArea:', err);
        this.allAreas = [];
        this.Loading = false;
      },
    });
  }

  // دالة لتحديث اللغة المختارة (نزيل default)
  selectLanguage(language: string) {
    if (language === 'english' || language === 'arabic') {
      this.selectedLanguage = language;
    }
  }

  // دالة الحفظ: إرسال إلى الـ API
  async handleSubmit(): Promise<void> {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.errorMessage =
        'الاسم بالعربي والانجليزي مطلوب ويجب أن يكون على الأقل حرفين';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const body = this.form.value;

    this.apiService.addArea(body).subscribe({
      next: (res) => {
        this.successMessage = 'تم إضافة المنطقة بنجاح';
        this.isLoading = false;
        this.form.reset();
        this.loadAllArea();
        setTimeout(() => this.resetForm(), 3000);
      },
      error: (err) => {
        console.error('خطأ في إضافة المنطقة:', err);
        this.errorMessage = err.error?.title || 'حدث خطأ أثناء إضافة المنطقة';
        this.isLoading = false;
      },
    });
  }

  resetForm() {
    this.form.reset();
    this.errorMessage = null;
    this.successMessage = null;
  }

  editArea(areaId: number) {
    // أو string حسب نوع الـ ID في الـ API
    this.router.navigate(['manageRestaurants/edit-setting-area', areaId]);
  }

  showSettings() {
    this.router.navigate(['manageRestaurants/sett-area']);
  }

  toggleIncentiveForm() {
    this.showIncentiveForm = false;
  }
}
