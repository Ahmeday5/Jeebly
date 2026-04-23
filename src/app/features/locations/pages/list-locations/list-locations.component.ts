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
import { Subject, takeUntil } from 'rxjs';
import { LocationsService } from '../../services/locations.service';
import { District, Governorate } from '../../model/location.type';
import { ToastService } from '../../../../core/services/toast.service';

declare const bootstrap: any;

@Component({
  selector: 'app-list-locations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list-locations.component.html',
  styleUrl: './list-locations.component.scss',
})
export class ListLocationsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('govModalEl')  govModalEl!: ElementRef;
  @ViewChild('distModalEl') distModalEl!: ElementRef;

  governorates: Governorate[] = [];
  districts: District[] = [];
  selectedGovId: number | null = null;
  selectedGovName = '';

  govForm!: FormGroup;
  distForm!: FormGroup;
  isLoadingGov  = false;
  isLoadingDist = false;
  isSavingGov   = false;
  isSavingDist  = false;

  private govModal!: any;
  private distModal!: any;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private locationsService: LocationsService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadGovernorates();
  }

  ngAfterViewInit(): void {
    this.govModal  = new bootstrap.Modal(this.govModalEl.nativeElement);
    this.distModal = new bootstrap.Modal(this.distModalEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.govForm = this.fb.group({
      nameAr: ['', [Validators.required, Validators.minLength(2)]],
      nameEn: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.distForm = this.fb.group({
      nameAr: ['', [Validators.required, Validators.minLength(2)]],
      nameEn: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  loadGovernorates(): void {
    this.isLoadingGov = true;
    this.locationsService.getAllGovernorates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => { this.governorates = data; this.isLoadingGov = false; },
        error: () => { this.toast.error('فشل تحميل المحافظات'); this.isLoadingGov = false; },
      });
  }

  selectGovernorate(gov: Governorate): void {
    this.selectedGovId   = gov.governorateId;
    this.selectedGovName = gov.nameAr;
    this.loadDistricts(gov.governorateId);
  }

  loadDistricts(govId: number): void {
    this.districts = [];
    this.isLoadingDist = true;
    this.locationsService.getDistrictsByGovernorate(govId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => { this.districts = data; this.isLoadingDist = false; },
        error: () => { this.toast.error('فشل تحميل المناطق'); this.isLoadingDist = false; },
      });
  }

  openGovModal(): void {
    this.govForm.reset();
    this.govModal.show();
  }

  openDistModal(): void {
    this.distForm.reset();
    this.distModal.show();
  }

  submitGov(): void {
    this.govForm.markAllAsTouched();
    if (this.govForm.invalid) return;

    this.isSavingGov = true;
    this.locationsService.createGovernorate(this.govForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('تم إضافة المحافظة بنجاح');
          this.isSavingGov = false;
          this.govModal.hide();
          this.loadGovernorates();
        },
        error: (err: any) => {
          this.toast.error(err.message || 'فشل إضافة المحافظة');
          this.isSavingGov = false;
        },
      });
  }

  submitDist(): void {
    this.distForm.markAllAsTouched();
    if (this.distForm.invalid || !this.selectedGovId) return;

    this.isSavingDist = true;
    this.locationsService
      .createDistrict({ ...this.distForm.value, governorateId: this.selectedGovId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success('تم إضافة المنطقة بنجاح');
          this.isSavingDist = false;
          this.distModal.hide();
          this.loadDistricts(this.selectedGovId!);
        },
        error: (err: any) => {
          this.toast.error(err.message || 'فشل إضافة المنطقة');
          this.isSavingDist = false;
        },
      });
  }

  fieldInvalid(form: FormGroup, name: string): boolean {
    const ctrl = form.get(name);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
