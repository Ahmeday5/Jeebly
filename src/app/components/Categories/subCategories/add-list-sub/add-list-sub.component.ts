import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MainCategory, SubCategory } from '../../../../core/types/categories.type';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-add-list-sub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-list-sub.component.html',
  styleUrl: './add-list-sub.component.scss',
})
export class AddListSubComponent {
  selectedLanguage: string = 'default'; //تتبع اللغة المختارة
  selectedLanguageLabel: string = 'افتراضي';
  selectedLanguageePlaceholder: string = 'يرجي ادخال لغة عربية';
  mainCategories: MainCategory[] = [];
  subCategories: SubCategory[] = [];
  selectedCategoryId: number | null = null;
  selectedMainCategoryForAdd: number | null = null;
  loading: boolean = false;
  loadingSub: boolean = false;
  noSubCategoriesMessage: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.fetchMainCategories();
  }

  fetchMainCategories() {
    this.loading = true;
    this.apiService.getAllCategories().subscribe({
      next: (data) => {
        this.mainCategories = data;
        this.loading = false;
        if (this.mainCategories.length > 0) {
          this.selectedCategoryId = this.mainCategories[0].id;
          this.selectedMainCategoryForAdd = this.mainCategories[0].id; // للفورم كمان
          this.onMainCategoryChange(); // جلب السب كاتيجوري مباشرة
        }
      },
      error: () => {
        this.noSubCategoriesMessage = 'فشل تحميل الفئات الرئيسية';
        this.loading = false;
      },
    });
  }

  onMainCategoryChange() {
    if (!this.selectedCategoryId) {
      this.subCategories = [];
      this.noSubCategoriesMessage = 'يرجى اختيار فئة رئيسية';
      return;
    }

    this.loadingSub = true;
    this.noSubCategoriesMessage = null;

    this.apiService
      .getSubCategoriesByCategoryId(this.selectedCategoryId)
      .subscribe({
        next: (data) => {
          this.subCategories = data;
          if (this.subCategories.length === 0) {
            this.noSubCategoriesMessage = 'لا توجد فئات فرعية لهذه الفئة';
          }
          this.loadingSub = false;
        },
        error: () => {
          this.noSubCategoriesMessage = 'فشل جلب الفئات الفرعية';
          this.loadingSub = false;
        },
      });
  }

  getMainCategoryName(categoryId: number): string {
    const category = this.mainCategories.find((c) => c.id === categoryId);
    return category ? category.name : 'غير معروف';
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

  editSubCategory(subCategoryId: number) {
    // لو عايز تبعت الـ id لصفحة التعديل
    this.router.navigate(['/update-subcategory', subCategoryId]);
  }
}
