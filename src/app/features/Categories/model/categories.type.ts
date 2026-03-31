// الفئة الرئيسية (Main Category)
export interface MainCategory {
  id: number;
  name: string;
}
export interface addMainCategory {
  RestaurantId: number;
  ServiesId: number;
  NameAr: string;
  NameEn: string;
  Image: string;
}

// الفئة الفرعية (SubCategory)
export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
}

// نوع الرد من API للفئات الرئيسية
export type MainCategoriesResponse = MainCategory[];

// نوع الرد من API للفئات الفرعية (لما تجيبها بـ categoryId)
export type SubCategoriesResponse = SubCategory[];
