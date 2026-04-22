import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { EditSettingAreaService } from '../../services/edit-setting-area.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-edit-setting-area',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './edit-setting-area.component.html',
  styleUrl: './edit-setting-area.component.scss',
})
export class EditSettingAreaComponent implements OnInit {
  selectedLanguage: string = 'arabic'; // نبدأ بالعربية كافتراضي
  showSettingsPage: boolean = true;
  showIncentiveForm: boolean = true;
  nameAr: string = ''; // الاسم العربي
  nameEn: string = ''; // الاسم الإنجليزي
  isLoading: boolean = false;
  Loading: boolean = false;

  //فورمات التعديل
  form!: FormGroup;

  currentEditingAreaId: number | null = null;

  constructor(
    private apiService: EditSettingAreaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    // جلب الـ ID من الـ URL
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.currentEditingAreaId = id;
        this.loadAreaForEdit(id);
      } else {
        this.toast.error('معرف المنطقة غير صالح');
        setTimeout(() => this.router.navigate(['/setting-areas']), 2000);
      }
    } else {
      this.toast.error('لم يتم تحديد منطقة للتعديل');
      setTimeout(() => this.router.navigate(['/setting-areas']), 2000);
    }

    this.initForm();
  }

  initForm() {
    this.form = this.fb.group({
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
    });
  }

  // دالة لتحديث اللغة المختارة (نزيل default)
  selectLanguage(language: string) {
    if (language === 'english' || language === 'arabic') {
      this.selectedLanguage = language;
    }
  }

  // جلب بيانات منطقة للتعديل
  loadAreaForEdit(id: number): void {
    this.Loading = true;

    this.apiService.getAreaById(id).subscribe({
      next: (res) => {
        const area = res.data || res;
        // نملأ البيانات في editEmployeeAdvance
        this.form.patchValue({
          nameAr: area.nameAr || '',
          nameEn: area.nameEn || '',
          latitude: area.latitude || 0,
          longitude: area.longitude || 0,
          point3: area.point3 || 0,
        });

        this.Loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading area for edit:', err);
        this.toast.error('فشل جلب بيانات المنطقة للتعديل');
        this.Loading = false;
      },
    });
  }

  async handleUpdateArea(): Promise<void> {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.toast.error('الاسم بالعربي والانجليزي مطلوب ويجب أن يكون على الأقل حرفين');
      return;
    }

    this.isLoading = true;
    const body = {
      ...this.form.value,
      nameAr: this.form.value.nameAr.trim(),
      nameEn: this.form.value.nameEn.trim(),
    };
    this.apiService.updateArea(this.currentEditingAreaId!, body).subscribe({
      next: () => {
        this.toast.success('تم تعديل بيانات المنطقة بنجاح');
        this.isLoading = false;
        setTimeout(() => {
          this.form.reset();
          this.router.navigate(['/manageRestaurants/setting-areas']);
        }, 1500);
      },
      error: (err) => {
        console.error('خطأ في تعديل المنطقة:', err);
        this.toast.error(err.error?.title || 'حدث خطأ أثناء تعديل المنطقة');
        this.isLoading = false;
      },
    });
  }

  resetForm() {
    this.form.reset();
  }
}
