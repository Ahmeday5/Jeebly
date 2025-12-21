// الفئة الرئيسية (Main Category)
export interface MainCategory {
  id: number;
  name: string;
  // لو فيه حاجات زي image أو description هتضيفها هنا بعدين
}

// الفئة الفرعية (SubCategory)
export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;        // مهم جدًا → عشان نعرف تابعة لأي Main Category
  // ممكن تضيف priority أو isActive أو paymentAmount بعدين
}

// نوع الرد من API للفئات الرئيسية
export type MainCategoriesResponse = MainCategory[];

// نوع الرد من API للفئات الفرعية (لما تجيبها بـ categoryId)
export type SubCategoriesResponse = SubCategory[];
