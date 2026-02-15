import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-restaurant.component.html',
  styleUrl: './add-restaurant.component.scss',
})
export class AddRestaurantComponent {
  selectedLanguage: string = 'default'; //تتبع اللغة المختارة
  selectedLanguageLabel: string = 'افتراضي';
  selectedLanguageePlaceholder: string = 'يرجي ادخال لغة عربية';
  logoError: string | null = null;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  RestaurantName: string = '';
  RestaurantAddress: string = '';
  Tax: string = '';
  EstimatedDeliveryTime: string = '';
  TypeOfFood: string = '';
  Area: string = '';
  latitude: string = '';
  Longitude: string = '';
  OwnersFirstName: string = '';
  OwnerLastName: string = '';
  OwnerPhone: string = '';
  Tags: string = '';
  Email: string = '';
  password: string = '';
  ConfirmPassword: string = '';
  coverError: string | null = null; // خطأ الغلاف
  LogoPreview: SafeUrl | null = null; // معاينة الشعار
  RestaurantCoverPreview: SafeUrl | null = null; // معاينة الغلاف
  Logo: File | null = null; // ملف الشعار
  RestaurantCover: File | null = null; // ملف الغلاف

  constructor(private sanitizer: DomSanitizer) {}

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
    const maxSize = 2 * 1024 * 1024;
    const validFormats = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/jfif',
    ];

    if (!validFormats.includes(file.type)) {
      this.setError(type, 'يرجى رفع صورة بصيغة jpg, png, jpeg , gif ,jfif');
      this.clearImage(type);
      return;
    }

    if (file.size > maxSize) {
      this.setError(type, 'حجم الصورة لا يتجاوز 2 ميجابايت');
      this.clearImage(type);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const requiredRatio = type === 'logo' ? 1 : 2; // 1:1 للشعار، 2:1 للغلاف
      const actualRatio = img.width / img.height;

      if (Math.abs(actualRatio - requiredRatio) > 0.01) {
        this.setError(
          type,
          type === 'logo'
            ? 'نسبة الشعار يجب أن تكون 1:1 (مربعة)'
            : 'نسبة الغلاف يجب أن تكون 2:1'
        );
        this.clearImage(type);
        return;
      }

      // كل حاجة تمام
      if (type === 'logo') {
        this.Logo = file;
        this.LogoPreview = this.sanitizer.bypassSecurityTrustUrl(
          URL.createObjectURL(file)
        );
      } else {
        this.RestaurantCover = file;
        this.RestaurantCoverPreview = this.sanitizer.bypassSecurityTrustUrl(
          URL.createObjectURL(file)
        );
      }
      this.clearError(type);
    };

    img.onerror = () => {
      this.setError(type, 'فشل تحميل الصورة');
      this.clearImage(type);
    };

    img.src = URL.createObjectURL(file);
  }

  private setError(type: 'logo' | 'cover', message: string) {
    if (type === 'logo') this.logoError = message;
    else this.coverError = message;

    // السطر الجديد ده هو الحل السحري
    Promise.resolve().then(() => {
      if (type === 'logo') this.logoError = message;
      else this.coverError = message;
    });
  }

  private clearError(type: 'logo' | 'cover') {
    if (type === 'logo') this.logoError = null;
    else this.coverError = null;
  }

  clearImage(type: 'logo' | 'cover') {
    if (type === 'logo') {
      this.Logo = null;
      this.LogoPreview = null;
    } else {
      this.RestaurantCover = null;
      this.RestaurantCoverPreview = null;
    }
    this.clearError(type);
  }

  removeImage(type: 'logo' | 'cover') {
    this.clearImage(type);
    const inputId = type === 'logo' ? 'logoUpload' : 'coverUpload';
    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  resetForm() {
    // امسح كل الحقول
    this.RestaurantName = '';
    this.RestaurantAddress = '';
    this.Tax = '';
    this.EstimatedDeliveryTime = '';
    this.TypeOfFood = '';
    this.Area = '';
    this.latitude = '';
    this.Longitude = '';
    this.OwnersFirstName = '';
    this.OwnerLastName = '';
    this.OwnerPhone = '';
    this.Tags = '';
    this.Email = '';
    this.password = '';
    this.ConfirmPassword = '';

    // امسح الصور
    this.removeImage('logo');
    this.removeImage('cover');

    this.logoError = null;
    this.coverError = null;
  }
}
