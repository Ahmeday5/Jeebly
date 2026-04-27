import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SettingsService } from '../../services/settings.service';
import { WorkingHoursService } from '../../services/working-hours.service';
import { ToastService } from '../../../../../../../core/services/toast.service';
import { RestaurantSetting } from '../../../../../model/setting.type';
import {
  WEEK_DAYS,
  WeekDayId,
  WorkingHour,
  WorkingHourPayload,
} from '../../../../../model/working-hours.type';

interface DayRowState {
  dayId: WeekDayId;
  recordId: number | null;
  saving: boolean;
  deleting: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  form!: FormGroup;
  hoursForm!: FormGroup;
  isLoading = false;
  isSaving = false;
  isLoadingHours = false;
  hasExistingSettings = false;
  restaurantId!: number;

  readonly weekDays = WEEK_DAYS;
  rowState: Record<number, DayRowState> = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private workingHoursService: WorkingHoursService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.restaurantId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.initForm();
    this.initHoursForm();
    this.loadSettings();
    this.loadWorkingHours();
  }

  // ───────── Settings ─────────
  private initForm(): void {
    this.form = this.fb.group({
      enableDelivery: [false],
      enableDineIn: [false],
      vatPercentage: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
    });
  }

  private loadSettings(): void {
    this.isLoading = true;
    this.settingsService.getSettings(this.restaurantId).subscribe({
      next: (data: RestaurantSetting | null) => {
        if (data) {
          this.hasExistingSettings = true;
          this.form.patchValue({
            enableDelivery: data.enableDelivery,
            enableDineIn: data.enableDineIn,
            vatPercentage: data.vatPercentage,
          });
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  handleSave(): void {
    if (this.form.invalid) return;

    const payload: RestaurantSetting = {
      restaurantId: this.restaurantId,
      enableDelivery: this.form.value.enableDelivery,
      enableDineIn: this.form.value.enableDineIn,
      vatPercentage: this.form.value.vatPercentage,
    };

    this.isSaving = true;
    const request$ = this.hasExistingSettings
      ? this.settingsService.updateSettings(payload)
      : this.settingsService.createSettings(payload);

    request$.subscribe({
      next: () => {
        this.hasExistingSettings = true;
        this.toast.success('تم حفظ الإعدادات بنجاح');
        this.isSaving = false;
      },
      error: (err: Error) => {
        this.toast.error(err.message || 'فشل حفظ الإعدادات');
        this.isSaving = false;
      },
    });
  }

  // ───────── Working hours ─────────
  private initHoursForm(): void {
    this.hoursForm = this.fb.group({
      days: this.fb.array(
        this.weekDays.map((d) =>
          this.fb.group({
            dayId: [d.id],
            isClosed: [false],
            openTime: ['09:00'],
            closeTime: ['23:00'],
          }),
        ),
      ),
    });

    this.weekDays.forEach((d) => {
      this.rowState[d.id] = {
        dayId: d.id,
        recordId: null,
        saving: false,
        deleting: false,
      };
    });
  }

  get days(): FormArray<FormGroup> {
    return this.hoursForm.get('days') as FormArray<FormGroup>;
  }

  dayMeta(index: number) {
    return this.weekDays[index];
  }

  rowFor(index: number): DayRowState {
    return this.rowState[this.weekDays[index].id];
  }

  private loadWorkingHours(): void {
    this.isLoadingHours = true;
    this.workingHoursService
      .getByRestaurant(this.restaurantId)
      .pipe(catchError(() => of<WorkingHour[]>([])))
      .subscribe((records) => {
        records.forEach((rec) => this.applyRecordToForm(rec));
        this.isLoadingHours = false;
        this.cdr.markForCheck();
      });
  }

  private applyRecordToForm(rec: WorkingHour): void {
    const idx = this.weekDays.findIndex((d) => d.id === rec.day);
    if (idx === -1) return;
    const group = this.days.at(idx);
    group.patchValue({
      isClosed: rec.isClosed,
      openTime: this.toInputTime(rec.openTime),
      closeTime: this.toInputTime(rec.closeTime),
    });
    this.rowState[rec.day].recordId = rec.id;
  }

  private toInputTime(value: string | null | undefined): string {
    if (!value) return '09:00';
    const parts = value.split(':');
    if (parts.length < 2) return '09:00';
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }

  private toApiTime(value: string | null | undefined): string {
    if (!value) return '00:00:00';
    const parts = value.split(':');
    const h = (parts[0] || '00').padStart(2, '0');
    const m = (parts[1] || '00').padStart(2, '0');
    const s = (parts[2] || '00').padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  saveDay(index: number): void {
    const group = this.days.at(index);
    const dayMeta = this.weekDays[index];
    const state = this.rowState[dayMeta.id];
    const isClosed: boolean = group.get('isClosed')?.value;

    if (!isClosed) {
      const open = group.get('openTime')?.value;
      const close = group.get('closeTime')?.value;
      if (!open || !close) {
        this.toast.warning('من فضلك حدد وقت الفتح ووقت الغلق');
        return;
      }
      if (open >= close) {
        this.toast.warning('وقت الغلق لازم يكون بعد وقت الفتح');
        return;
      }
    }

    const payload: WorkingHourPayload = {
      restaurantId: this.restaurantId,
      day: dayMeta.id,
      isClosed,
      openTime: isClosed ? null : this.toApiTime(group.get('openTime')?.value),
      closeTime: isClosed ? null : this.toApiTime(group.get('closeTime')?.value),
    };

    state.saving = true;

    const request$ = state.recordId
      ? this.workingHoursService.update(state.recordId, payload)
      : this.workingHoursService.create(payload);

    request$.subscribe({
      next: () => {
        state.saving = false;
        this.toast.success(
          state.recordId
            ? `تم تحديث ساعات يوم ${dayMeta.nameAr}`
            : `تم حفظ ساعات يوم ${dayMeta.nameAr}`,
        );
        if (!state.recordId) {
          // Reload list to capture the newly assigned record id from the server.
          this.loadWorkingHours();
        }
      },
      error: (err: Error) => {
        state.saving = false;
        this.toast.error(err.message || 'فشل حفظ ساعات العمل');
      },
    });
  }

  deleteDay(index: number): void {
    const dayMeta = this.weekDays[index];
    const state = this.rowState[dayMeta.id];
    if (!state.recordId) {
      // Nothing to delete on the server — just reset the row locally.
      this.days.at(index).patchValue({
        isClosed: false,
        openTime: '09:00',
        closeTime: '23:00',
      });
      return;
    }

    state.deleting = true;
    this.workingHoursService.delete(state.recordId).subscribe({
      next: () => {
        state.deleting = false;
        state.recordId = null;
        this.days.at(index).patchValue({
          isClosed: false,
          openTime: '09:00',
          closeTime: '23:00',
        });
        this.toast.success(`تم حذف ساعات يوم ${dayMeta.nameAr}`);
      },
      error: (err: Error) => {
        state.deleting = false;
        this.toast.error(err.message || 'فشل حذف ساعات العمل');
      },
    });
  }
}
