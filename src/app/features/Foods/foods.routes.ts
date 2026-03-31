import { Routes } from '@angular/router';

export const FOODS_ROUTES: Routes = [
  {
    path: 'list-food',
    loadComponent: () =>
      import('./pages/list-food/list-food.component').then(
        (m) => m.ListFoodComponent,
      ),
    title: 'قائمة الأطعمة',
  },
  {
    path: 'add-food',
    loadComponent: () =>
      import('./pages/add-food/add-food.component').then(
        (m) => m.AddFoodComponent,
      ),
    title: 'اضافة الطعام',
  },
  {
    path: 'edit-food',
    loadComponent: () =>
      import('./pages/edti-food/edti-food.component').then(
        (m) => m.EdtiFoodComponent,
      ),
    title: 'تحديث الطعام',
  },
  {
    path: 'evaluation-food',
    loadComponent: () =>
      import('./pages/evaluation-food/evaluation-food.component').then(
        (m) => m.EvaluationFoodComponent,
      ),
    title: 'تقييم الطعام',
  },
];
