import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-food',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-food.component.html',
  styleUrl: './add-food.component.scss',
})
export class AddFoodComponent {
  selectedLanguage: string = 'default'; //تتبع اللغة المختارة
  selectedLanguageLabel: string = 'افتراضي';
  selectedLanguageePlaceholder: string = 'يرجي ادخال لغة عربية';

  logoError: string | null = null;
  coverError: string | null = null;
  logoRequiredError: string | null = null;
  coverRequiredError: string | null = null;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  LogoPreview: SafeUrl | null = null;
  CoverPreview: SafeUrl | null = null;
  Logo: File | null = null;
  Cover: File | null = null;

  constructor(
    private sanitizer: DomSanitizer,
  ) {}

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

  onFileChange(event: Event, type: 'logo' | 'cover'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.clearImage(type);
      return;
    }

    const file = input.files[0];

    // فلترة بسيطة للصيغ والحجم (اختياري)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('الصيغة غير مدعومة. استخدم jpg أو png أو gif');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5 ميجا كحد أقصى مثال
      alert('حجم الصورة كبير جدًا (الحد الأقصى 5 ميجا)');
      return;
    }

    // إنشاء preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const previewUrl = e.target.result as string;

      if (type === 'logo') {
        this.LogoPreview = this.sanitizer.bypassSecurityTrustUrl(previewUrl);
        this.Logo = file;
      } else {
        this.CoverPreview = this.sanitizer.bypassSecurityTrustUrl(previewUrl);
        this.Cover = file;
      }
    };
    reader.readAsDataURL(file); // ← هنا السر: Data URL للمعاينة الفورية
  }

  clearImage(type: 'logo' | 'cover'): void {
    if (type === 'logo') {
      this.LogoPreview = null;
      this.Logo = null;
    } else {
      this.CoverPreview = null;
      this.Cover = null;
    }
  }

  removeImage(type: 'logo' | 'cover'): void {
    this.clearImage(type);
    // إعادة تعيين الـ input file
    const input = document.getElementById(
      type === 'logo' ? 'logoUpload' : 'coverUpload',
    ) as HTMLInputElement;
    if (input) input.value = '';
  }
}
