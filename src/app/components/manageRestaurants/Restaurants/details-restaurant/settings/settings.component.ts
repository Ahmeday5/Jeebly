import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  selectedLanguage: string = 'default'; //تتبع اللغة المختارة
  selectedLanguageLabel: string = 'افتراضي';
  selectedLanguageePlaceholder: string = 'يرجي ادخال لغة عربية';
  logoError: string | null = null; // رسالة خطأ للشعار
  coverError: string | null = null; // رسالة خطأ لغلاف المطعم
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // دالة لتحديث اللغة المختارة
  selectLanguage(language: string) {
    this.selectedLanguage = language;
    this.selectedLanguageLabel = this.getLanguageLabel(language);
    this.selectedLanguageePlaceholder = this.getLanguagePlaceholder(language);
  }

  private getLanguageLabel(language: string): string {
    switch (language) {
      case 'default':
        return 'افتراضي';
      case 'english':
        return 'English (EN)';
      case 'arabic':
        return 'Arabic - العربية (AR)';
      default:
        return 'افتراضي';
    }
  }

  private getLanguagePlaceholder(language: string): string {
    switch (language) {
      case 'default':
        return 'يرجي ادخال لغة عربية';
      case 'english':
        return 'يرجي ادخال لغة انجليزية';
      case 'arabic':
        return 'يرجي ادخال لغة عربية';
      default:
        return 'افتراضي';
    }
  }

  // التحقق من الملفات المرفوعة (شعار أو غلاف)
  onFileChange(event: Event, type: 'logo' | 'cover'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const maxSizeMB = 2 * 1024 * 1024; // 2 ميجابايت بالبايت
      const validFormats = ['image/jpeg', 'image/png', 'image/gif'];

      // التحقق من صيغة الملف
      if (!validFormats.includes(file.type)) {
        this.setError(type, 'يرجى رفع صورة بصيغة jpg, png, أو gif فقط');
        return;
      }

      // التحقق من الحجم
      if (file.size > maxSizeMB) {
        this.setError(type, 'حجم الملف يجب ألا يتجاوز 2 ميجابايت');
        return;
      }

      // التحقق من نسبة العرض إلى الارتفاع (2:1)
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        if (aspectRatio !== 2) {
          this.setError(type, 'نسبة العرض إلى الارتفاع يجب أن تكون 2:1');
          return;
        }
        this.clearError(type); // مسح الخطأ إذا كان كل شيء صحيح
      };
      img.src = URL.createObjectURL(file);
    }
  }

  // تعيين رسالة الخطأ
  private setError(type: 'logo' | 'cover', message: string): void {
    if (type === 'logo') this.logoError = message;
    else this.coverError = message;
  }

  // مسح رسالة الخطأ
  private clearError(type: 'logo' | 'cover'): void {
    if (type === 'logo') this.logoError = null;
    else this.coverError = null;
  }
}
