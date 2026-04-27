import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { LocationsService } from '../../../locations/services/locations.service';
import { AppUser } from '../../model/user.type';
import { District, Governorate } from '../../../locations/model/location.type';
import { ToastService } from '../../../../core/services/toast.service';

declare const bootstrap: any;

const ROLES = [
  { value: 'Customer', label: 'مستخدم' },
  { value: 'Admin', label: 'مدير' },
  { value: 'DeliveryMan', label: 'سائق' },
  { value: 'RestaurantOwner', label: 'مالك مطعم' },
];

@Component({
  selector: 'app-list-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list-users.component.html',
  styleUrl: './list-users.component.scss',
})

export class ListUsersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('userModalEl') userModalEl!: ElementRef;
  @ViewChild('deleteModalEl') deleteModalEl!: ElementRef;

  users: AppUser[] = [];
  filteredUsers: AppUser[] = [];
  governorates: Governorate[] = [];
  districts: District[] = [];
  roles = ROLES;

  userForm!: FormGroup;
  editingId: string | null = null;
  deletingId: string | null = null;
  deletingName = '';
  searchQuery = '';

  isLoading = false;
  isSaving = false;
  isDeleting = false;
  isLoadingGov = false;
  isLoadingDist = false;

  private userModal!: any;
  private deleteModal!: any;
  private isInitializing = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private locationsService: LocationsService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupCascade();
    this.loadUsers();
    this.loadGovernorates();
  }

  ngAfterViewInit(): void {
    this.userModal = new bootstrap.Modal(this.userModalEl.nativeElement);
    this.deleteModal = new bootstrap.Modal(this.deleteModalEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Form ────────────────────────────────────────────────────────────────
  private initForm(): void {
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.minLength(8)]],
      address: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birthDate: ['', [Validators.required]],
      governorateId: [null, [Validators.required]],
      districtid: [null, [Validators.required]],
      role: ['', [Validators.required]],
    });
  }

  private setupCascade(): void {
    this.userForm
      .get('governorateId')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((govId) => {
        if (this.isInitializing) return;
        this.districts = [];
        this.userForm.get('districtid')!.setValue(null, { emitEvent: false });
        if (govId) this.loadDistricts(govId);
      });
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────
  loadUsers(): void {
    this.isLoading = true;
    this.usersService
      .getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.users = data;
          this.applyFilter();
          this.isLoading = false;
        },
        error: () => {
          this.toast.error('فشل تحميل المستخدمين');
          this.isLoading = false;
        },
      });
  }

  loadGovernorates(): void {
    this.isLoadingGov = true;
    this.locationsService
      .getAllGovernorates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.governorates = data;
          this.isLoadingGov = false;
        },
        error: () => {
          this.isLoadingGov = false;
        },
      });
  }

  loadDistricts(govId: number): void {
    this.districts = [];
    this.isLoadingDist = true;
    this.locationsService
      .getDistrictsByGovernorate(govId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.districts = data;
          this.isLoadingDist = false;
        },
        error: () => { this.isLoadingDist = false; },
      });
  }

  // ─── Search ───────────────────────────────────────────────────────────────
  onSearch(query: string): void {
    this.searchQuery = query;
    this.applyFilter();
  }

  private applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredUsers = q
      ? this.users.filter(
          (u) =>
            u.fullName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.phoneNumber?.includes(q),
        )
      : [...this.users];
  }

  // ─── Modal: Add ───────────────────────────────────────────────────────────
  openAddModal(): void {
    this.editingId = null;
    this.districts = [];
    this.userForm.reset();
    this.setAddOnlyRequired(true);
    this.userModal.show();
  }

  // ─── Modal: Edit ──────────────────────────────────────────────────────────
  openEditModal(user: AppUser): void {
    this.editingId = this.getUserId(user);
    this.isInitializing = true;
    this.setAddOnlyRequired(false);

    this.userForm.patchValue(
      {
        fullName: user.fullName,
        email:    user.email,
        phoneNumber: user.phoneNumber,
        role:     user.role,
      },
      { emitEvent: false },
    );

    setTimeout(() => { this.isInitializing = false; }, 0);
    this.userModal.show();
  }

  private setAddOnlyRequired(required: boolean): void {
    const addOnlyFields: { name: string; validators: any[] }[] = [
      { name: 'password',     validators: [Validators.required, Validators.minLength(6)] },
      { name: 'address',      validators: [Validators.required] },
      { name: 'birthDate',    validators: [Validators.required] },
      { name: 'governorateId', validators: [Validators.required] },
      { name: 'districtid',   validators: [Validators.required] },
    ];

    for (const field of addOnlyFields) {
      const ctrl = this.userForm.get(field.name)!;
      if (required) {
        ctrl.setValidators(field.validators);
      } else {
        ctrl.clearValidators();
      }
      ctrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  submitUser(): void {
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid) return;

    this.isSaving = true;
    const v = this.userForm.value;

    const request$ = this.editingId
      ? this.usersService.updateUser(this.editingId, {
          email: v.email,
          phone: v.phoneNumber,
          fullName: v.fullName,
        })
      : this.usersService.addUser(v);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toast.success(
          this.editingId
            ? 'تم تعديل المستخدم بنجاح'
            : 'تم إضافة المستخدم بنجاح',
        );
        this.isSaving = false;
        this.userModal.hide();
        this.loadUsers();
      },
      error: (err: any) => {
        this.toast.error(err.message || 'فشلت العملية');
        this.isSaving = false;
      },
    });
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  confirmDelete(user: AppUser): void {
    this.deletingId = this.getUserId(user);
    this.deletingName = user.fullName;
    this.deleteModal.show();
  }

  executeDelete(): void {
    if (!this.deletingId) return;
    this.isDeleting = true;

    this.usersService
      .deleteUser(this.deletingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.users = this.users.filter((u) => this.getUserId(u) !== this.deletingId);
          this.applyFilter();
          this.toast.success('تم حذف المستخدم بنجاح');
          this.isDeleting = false;
          this.deletingId = null;
          this.deleteModal.hide();
        },
        error: (err: any) => {
          this.toast.error(err.message || 'فشل الحذف');
          this.isDeleting = false;
        },
      });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  getUserId(user: AppUser): string {
    return (user as any).userId || (user as any).Id || user.id || '';
  }

  fieldInvalid(name: string): boolean {
    const ctrl = this.userForm.get(name);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get hasGovernorate(): boolean {
    return !!this.userForm.get('governorateId')?.value;
  }

  getRoleLabel(value: string): string {
    return ROLES.find((r) => r.value === value)?.label ?? value;
  }
}
