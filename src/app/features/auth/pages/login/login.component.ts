import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';
import { LoginResponse } from '../../../../core/types/login.type';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const savedEmail = this.authService.getSavedEmail();
    if (savedEmail) {
      this.email = savedEmail;
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (form.valid) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.toast.error('البريد الإلكتروني غير صالح.');
        return;
      }
      if (this.password.length < 6) {
        this.toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
        return;
      }
      this.isLoading = true;
      try {
        const credentials = { email: this.email, password: this.password };
        const response = (await firstValueFrom(
          this.apiService.login(credentials)
        )) as LoginResponse;
        this.authService.login(response);
        await this.router.navigate(['/dashboard']);
      } catch (error: any) {
        this.toast.error(error.message || 'حدث خطأ غير معروف.');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.toast.error('يرجى تعبئة جميع الحقول بشكل صحيح.');
    }
  }
}
