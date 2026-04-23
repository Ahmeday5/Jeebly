import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { ToastService } from '../../../../../../../core/services/toast.service';
import { RestaurantSetting } from '../../../../../model/setting.type';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  isSaving = false;
  hasExistingSettings = false;
  restaurantId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.restaurantId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadSettings();
  }

  private initForm(): void {
    this.form = this.fb.group({
      enableDelivery: [false],
      enableDineIn:   [false],
      vatPercentage:  [0, [Validators.required, Validators.min(0), Validators.max(100)]],
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
            enableDineIn:   data.enableDineIn,
            vatPercentage:  data.vatPercentage,
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
      restaurantId:   this.restaurantId,
      enableDelivery: this.form.value.enableDelivery,
      enableDineIn:   this.form.value.enableDineIn,
      vatPercentage:  this.form.value.vatPercentage,
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
      error: (err: any) => {
        this.toast.error(err.message || 'فشل حفظ الإعدادات');
        this.isSaving = false;
      },
    });
  }
}
