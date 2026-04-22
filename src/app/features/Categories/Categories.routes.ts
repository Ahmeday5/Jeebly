import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: 'add-list-category',
    loadComponent: () =>
      import('./pages/mainCategories/add-list/add-list.component').then((m) => m.AddListComponent),
    title: 'قائمة الفئات',
  },
  {
    path: 'update-category/:id',
    loadComponent: () =>
      import('./pages/mainCategories/update-category/update-category.component').then(
        (m) => m.UpdateCategoryComponent,
      ),
    title: 'تحديث فئة',
  },
  {
    path: 'add-list-subcategory',
    loadComponent: () =>
      import('./pages/subCategories/add-list-sub/add-list-sub.component').then(
        (m) => m.AddListSubComponent,
      ),
    title: 'قائمة الفئات الفرعية',
  },
  {
    path: 'update-subcategory',
    loadComponent: () =>
      import('./pages/subCategories/update-sub-category/update-sub-category.component').then(
        (m) => m.UpdateSubCategoryComponent,
      ),
    title: 'تحديث فئة فرعية',
  },
];
