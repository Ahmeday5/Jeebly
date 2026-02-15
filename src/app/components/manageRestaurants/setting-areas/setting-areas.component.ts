import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { allArea } from '../../../types/area.type';
@Component({
  selector: 'app-setting-areas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './setting-areas.component.html',
  styleUrl: './setting-areas.component.scss',
})
export class SettingAreasComponent implements OnInit {
  selectedLanguage: string = 'arabic'; // نبدأ بالعربية كافتراضي
  showSettingsPage: boolean = true;
  showIncentiveForm: boolean = true;
  nameAr: string = ''; // الاسم العربي
  nameEn: string = ''; // الاسم الإنجليزي
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  //table
  allAreas: allArea[] = [];
  Loading: boolean = false;

  //form
  @ViewChild('form') form!: NgForm;
  @ViewChild('form', { static: false, read: ElementRef })
  formElement!: ElementRef<HTMLFormElement>;

  area: {
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

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadAllArea();
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

  // دالة الريست (تفريغ الاسمين)
  resetAddZoneForm() {
    this.nameAr = '';
    this.nameEn = '';
    this.successMessage = '';
    this.errorMessage = '';
    if (this.form) {
      this.form.resetForm(); // نفرغ الفورم
    }
  }

  // دالة الحفظ: إرسال إلى الـ API
  async handleSubmit(): Promise<void> {
    // السطرين دول هما السحر: بيخلوا كل الحقول تُعتبر "ملموسة" ويظهر الأخطاء فورًا
    this.form.form.markAllAsTouched(); // <--- مهم جدًا
    this.formElement.nativeElement.classList.add('was-validated'); // <--- ده لـ Bootstrap

    if (!this.form.valid) {
      // لو الفورم مش صح، وقف هنا ومتكملش
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const body = {
      nameAr: this.area.nameAr.trim(),
      nameEn: this.area.nameEn.trim(),
      latitude: this.area.latitude,
      longitude: this.area.longitude,
      point3: this.area.point3,
    };

    try {
      const result = await firstValueFrom(this.apiService.addArea(body));
      // result دايمًا هيبقى object فيه success و message
      if (result.success) {
        this.successMessage = 'تم إضافة المنطقة التجارية بنجاح ✓';
        this.form.resetForm();
        this.area.nameAr = '';
        this.area.nameEn = '';
        this.formElement.nativeElement.classList.remove('was-validated');
        setTimeout(() => (this.successMessage = null), 2000);
      } else {
        this.errorMessage = result.message;
      }
    } catch (err: any) {
      this.errorMessage = err?.message || 'حدث خطأ غير متوقع';
      console.error('خطأ غير متوقع:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  editArea(areaId: number) {
    // أو string حسب نوع الـ ID في الـ API
    this.router.navigate(['/edit-setting-area', areaId]);
  }

  showSettings() {
    this.router.navigate(['/sett-area']);
  }

  toggleIncentiveForm() {
    this.showIncentiveForm = false;
  }
}
