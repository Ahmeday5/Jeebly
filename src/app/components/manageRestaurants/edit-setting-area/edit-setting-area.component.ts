import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  errorMessage: string | null = null;
  successMessage: string | null = null;

  //form
  @ViewChild('editForm') editForm!: NgForm;
  @ViewChild('editForm', { static: false, read: ElementRef })
  editFormElement!: ElementRef<HTMLFormElement>;

  editArea: {
    nameAr: string;
    nameEn: string;
    latitude: number;
    longitude: number;
    point3: number;
  } = {
    nameAr: '',
    nameEn: '',
    latitude: 0,
    longitude: 0,
    point3: 0,
  };

  currentEditingAreaId: number | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private route: ActivatedRoute
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
        this.errorMessage = 'معرف المنطقة غير صالح';
        setTimeout(() => this.router.navigate(['/setting-areas']), 2000);
      }
    } else {
      this.errorMessage = 'لم يتم تحديد منطقة للتعديل';
      setTimeout(() => this.router.navigate(['/setting-areas']), 2000);
    }
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
        const area = res.data || res ;
        // نملأ البيانات في editEmployeeAdvance
        this.editArea = {
          nameAr: area.nameAr || '',
          nameEn: area.nameEn || '',
          latitude: area.latitude || 0,
          longitude: area.longitude || 0,
          point3: area.point3 || 0,
        };

        this.Loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading area for edit:', err);
        this.errorMessage = 'فشل جلب بيانات المنطقة للتعديل';
        setTimeout(() => (this.errorMessage = null), 3000);
        this.Loading = false;
      },
    });
  }

  async handleUpdateArea(): Promise<void> {
    // السطرين دول هما السحر: بيخلوا كل الحقول تُعتبر "ملموسة" ويظهر الأخطاء فورًا
    this.editForm.form.markAllAsTouched();
    this.editFormElement.nativeElement.classList.add('was-validated');

    if (!this.editForm.valid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const body = {
      nameAr: this.editArea.nameAr.trim(),
      nameEn: this.editArea.nameEn.trim(),
      latitude: this.editArea.latitude,
      longitude: this.editArea.longitude,
      point3: this.editArea.point3,
    };

    try {
      const result = await firstValueFrom(
        this.apiService.updateArea(this.currentEditingAreaId!, body)
      );

      if (result.success) {
        this.successMessage = 'تم تعديل بيانات المنطقة بنجاح ✓';
        setTimeout(() => (this.successMessage = null), 3000);
      } else {
        this.errorMessage = result.message || 'حدث خطأ أثناء التعديل';
        setTimeout(() => (this.errorMessage = null), 3000);
      }
    } catch (err: any) {
      this.errorMessage = 'فشل الاتصال بالخادم';
      setTimeout(() => (this.errorMessage = null), 3000);
    } finally {
      this.isLoading = false;
    }
  }

  // دالة الريست (تفريغ الاسمين)
  resetAddZoneForm() {
    this.nameAr = '';
    this.nameEn = '';
    this.successMessage = '';
    this.errorMessage = '';
    if (this.editForm) {
      this.editForm.resetForm(); // نفرغ الفورم
    }
  }
}
