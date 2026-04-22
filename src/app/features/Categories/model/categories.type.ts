// الفئة الرئيسية (Main Category)
export interface MainCategory {
  id: number;
  name: string;
  image: string;
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

export interface MainCategoriesResponse<T> {
  statusCode: number;
  message: string;
  data: T[]; // ✅ مش nested
}

// نوع الرد من API للفئات الفرعية (لما تجيبها بـ categoryId)
export type SubCategoriesResponse = SubCategory[];
