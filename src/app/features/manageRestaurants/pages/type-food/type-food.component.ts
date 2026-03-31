import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // إضافة مهمة

@Component({
  selector: 'app-type-food',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './type-food.component.html',
  styleUrl: './type-food.component.scss',
})
export class TypeFoodComponent {
  selectedLanguage: string = 'default'; // ابدأ بعربي أحسن
  selectedLanguageLabel: string = 'Arabic - العربية (AR)';
  selectedLanguageePlaceholder: string = 'يرجي ادخال لغة عربية';

  kitchenName: string = '';
  imageEat: File | null = null;
  imageEatPreview: SafeUrl | null = null; // لعرض معاينة الصورة بأمان

  logoError: string | null = null;

  constructor(private sanitizer: DomSanitizer) {} // إضافة DomSanitizer

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
      case 'arabic':
        return 'يرجي ادخال لغة عربية';
      case 'english':
        return 'يرجي ادخال لغة انجليزية';
      default:
        return 'يرجي ادخال لغة عربية';
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.clearImage();
      return;
    }

    const file = input.files[0];
    const maxSizeMB = 2 * 1024 * 1024; // 2 ميجا
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    // تحقق الصيغة
    if (!validFormats.includes(file.type)) {
      this.logoError = 'يرجى رفع صورة بصيغة jpg, png, أو gif فقط';
      this.clearImage();
      return;
    }

    // تحقق الحجم
    if (file.size > maxSizeMB) {
      this.logoError = 'حجم الملف يجب ألا يتجاوز 2 ميجابايت';
      this.clearImage();
      return;
    }

    // تحقق نسبة 1:1
    const img = new Image();
    img.onload = () => {
      if (img.width !== img.height) {
        this.logoError = 'نسبة الصورة يجب أن تكون 1:1 (مربعة)';
        this.clearImage();
        return;
      }

      // كل حاجة تمام → عرض الصورة
      this.imageEat = file;
      this.imageEatPreview = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(file)
      );
      this.logoError = null;
    };
    img.onerror = () => {
      this.logoError = 'فشل تحميل الصورة';
      this.clearImage();
    };
    img.src = URL.createObjectURL(file);
  }

  clearImage() {
    this.imageEat = null;
    this.imageEatPreview = null;
  }

  resetAddKitchenForm() {
    this.kitchenName = '';
    this.clearImage();
    // لمسح الـ file input فعليًا
    const fileInput = document.getElementById('logoUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    this.logoError = null;
  }

  resetFileInput() {
    const fileInput = document.getElementById('logoUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}
