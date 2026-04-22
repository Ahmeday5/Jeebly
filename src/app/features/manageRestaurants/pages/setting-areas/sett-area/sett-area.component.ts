import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { EditSettingAreaService } from '../../../services/edit-setting-area.service';
import { ToastService } from '../../../../../core/services/toast.service';

@Component({
  selector: 'app-sett-area',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sett-area.component.html',
  styleUrl: './sett-area.component.scss',
})
export class SettAreaComponent {
  showIncentiveForm: boolean = true; // متغير للتحكم بعرض فورم الحوافز

  // متغيرات رسوم التوصيل
  minDeliveryFee: number | null = null;
  maxDeliveryFee: number | null = null;
  maxCashOrder: number | null = null;
  increaseFeePercent: number | null = null;
  feePerKm: number | null = null;
  increaseFeeMessage: string = '';

  // متغيرات الحوافز
  dailyIncomeTarget: number | null = null;
  incentiveAmount: number | null = null;

  lowestDeliveryFees: number = 0;
  maximumDeliveryFees: number = 0;
  deliveryFeePerKilometre: number = 0;
  increasedDeliveryFees: number = 0;
  messageOfIncreasedDeliveryFees: string = '';
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
      lowestDeliveryFees: [0, [Validators.required]],
      maximumDeliveryFees: [0, [Validators.required]],
      deliveryFeePerKilometre: [0, [Validators.required]],
      increasedDeliveryFees: [0, [Validators.required]],
      messageOfIncreasedDeliveryFees: ['', [Validators.required]],
    });
  }

  // جلب بيانات منطقة للتعديل
  loadAreaForEdit(id: number): void {
    this.Loading = true;

    this.apiService.getByIdAreaDeliveryFees(id).subscribe({
      next: (res) => {
        const area = res.data || res;
        // نملأ البيانات في editEmployeeAdvance
        this.form.patchValue({
          lowestDeliveryFees: area.lowestDeliveryFees || 0,
          maximumDeliveryFees: area.maximumDeliveryFees || 0,
          deliveryFeePerKilometre: area.deliveryFeePerKilometre || 0,
          increasedDeliveryFees: area.increasedDeliveryFees || 0,
          messageOfIncreasedDeliveryFees:
            area.messageOfIncreasedDeliveryFees || '',
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
      this.toast.error('يرجى ملء جميع الحقول');
      return;
    }

    this.isLoading = true;
    const body = {
      ...this.form.value,
      lowestDeliveryFees: this.form.value.lowestDeliveryFees,
      maximumDeliveryFees: this.form.value.maximumDeliveryFees,
      deliveryFeePerKilometre: this.form.value.deliveryFeePerKilometre,
      increasedDeliveryFees: this.form.value.increasedDeliveryFees,
      messageOfIncreasedDeliveryFees:
        this.form.value.messageOfIncreasedDeliveryFees.trim(),
    };
    this.apiService
      .updateAreaDeliveryFees(this.currentEditingAreaId!, body)
      .subscribe({
        next: () => {
          this.toast.success('تم تعديل بيانات المنطقة بنجاح');
          this.isLoading = false;
          setTimeout(() => {
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

  toggleIncentiveForm() {
    this.showIncentiveForm = false;
  }

  resetIncentiveForm() {
    this.dailyIncomeTarget = null;
    this.incentiveAmount = null;
  }
}
