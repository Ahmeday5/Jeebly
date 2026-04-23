import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DiscountService } from '../../services/discount.service';
import { Discount, DiscountPayload } from '../../../../../model/discount.type';
import { ToastService } from '../../../../../../../core/services/toast.service';

declare const bootstrap: any;

@Component({
  selector: 'app-discounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './discounts.component.html',
  styleUrl: './discounts.component.scss',
})
export class DiscountsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('discountModalEl') discountModalEl!: ElementRef;
  @ViewChild('deleteModalEl') deleteModalEl!: ElementRef;

  discounts: Discount[] = [];
  restaurantId!: number;
  form!: FormGroup;
  isLoading = false;
  isSaving = false;
  isDeleting = false;
  editingId: number | null = null;
  deletingId: number | null = null;

  private discountModal!: any;
  private deleteModal!: any;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private discountService: DiscountService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.restaurantId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadDiscounts();
  }

  ngAfterViewInit(): void {
    this.discountModal = new bootstrap.Modal(this.discountModalEl.nativeElement);
    this.deleteModal = new bootstrap.Modal(this.deleteModalEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get activeCount(): number {
    const now = new Date();
    return this.discounts.filter(
      (d) => new Date(d.startDate) <= now && new Date(d.endDate) >= now,
    ).length;
  }

  get maxDiscount(): number {
    return this.discounts.length
      ? Math.max(...this.discounts.map((d) => d.discountAmount))
      : 0;
  }

  fieldInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  private initForm(): void {
    this.form = this.fb.group({
      discountAmount:  [null, [Validators.required, Validators.min(1), Validators.max(100)]],
      minimumPurchase: [null, [Validators.required, Validators.min(0)]],
      maximumDiscount: [null, [Validators.required, Validators.min(0)]],
      startDate:       ['', Validators.required],
      endDate:         ['', Validators.required],
      startTime:       ['', Validators.required],
      endTime:         ['', Validators.required],
    });
  }

  loadDiscounts(): void {
    this.isLoading = true;
    this.discountService
      .getDiscounts(this.restaurantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.discounts = data;
          this.isLoading = false;
        },
        error: () => {
          this.toast.error('فشل تحميل الخصومات');
          this.isLoading = false;
        },
      });
  }

  openAddModal(): void {
    this.editingId = null;
    this.form.reset();
    this.discountModal.show();
  }

  openEditModal(discount: Discount): void {
    this.editingId = discount.id;
    this.form.patchValue({
      discountAmount:  discount.discountAmount,
      minimumPurchase: discount.minimumPurchase,
      maximumDiscount: discount.maximumDiscount,
      startDate:       discount.startDate.split('T')[0],
      endDate:         discount.endDate.split('T')[0],
      startTime:       discount.startTime.substring(0, 5),
      endTime:         discount.endTime.substring(0, 5),
    });
    this.discountModal.show();
  }

  openDeleteModal(id: number): void {
    this.deletingId = id;
    this.deleteModal.show();
  }

  handleSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const payload = this.buildPayload();
    this.isSaving = true;

    const request$: Observable<any> = this.editingId
      ? this.discountService.updateDiscount(this.editingId, payload)
      : this.discountService.addDiscount(payload);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (this.editingId) {
          this.discounts = this.discounts.map((d) =>
            d.id === this.editingId ? { ...d, ...payload, id: this.editingId! } : d,
          );
          this.toast.success('تم تعديل الخصم بنجاح');
        } else {
          this.discounts = Array.isArray(res) ? res : (res?.data ?? this.discounts);
          this.toast.success('تم إضافة الخصم بنجاح');
        }
        this.loadDiscounts();
        this.isSaving = false;
        this.discountModal.hide();
      },
      error: (err: any) => {
        this.toast.error(err.message || 'فشل حفظ الخصم');
        this.isSaving = false;
      },
    });
  }

  confirmDelete(): void {
    if (!this.deletingId) return;
    this.isDeleting = true;

    this.discountService
      .deleteDiscount(this.deletingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.discounts = this.discounts.filter((d) => d.id !== this.deletingId);
          this.toast.success('تم حذف الخصم بنجاح');
          this.loadDiscounts();
          this.isDeleting = false;
          this.deletingId = null;
          this.deleteModal.hide();
        },
        error: (err: any) => {
          this.toast.error(err.message || 'فشل حذف الخصم');
          this.isDeleting = false;
        },
      });
  }

  private buildPayload(): DiscountPayload {
    const v = this.form.value;
    return {
      restaurantId:    this.restaurantId,
      discountAmount:  v.discountAmount,
      minimumPurchase: v.minimumPurchase,
      maximumDiscount: v.maximumDiscount,
      startDate:       new Date(v.startDate).toISOString(),
      endDate:         new Date(v.endDate).toISOString(),
      startTime:       v.startTime + ':00',
      endTime:         v.endTime + ':00',
    };
  }
}
