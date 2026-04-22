import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductsService } from '../../services/list-food.service';
import { Product } from '../../model/food.type';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-list-food',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './list-food.component.html',
  styleUrl: './list-food.component.scss',
})
export class ListFoodComponent implements OnInit {
  products: Product[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalCount = 0;
  readonly baseUrl = environment.apiBaseUrl;

  constructor(
    private router: Router,
    private productsService: ProductsService,
    private toast: ToastService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productsService.getProducts(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.products = res.products;
        this.totalPages = res.totalPages;
        this.totalCount = res.totalCount;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('فشل جلب قائمة المنتجات');
        this.isLoading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  editFood(id: number): void {
    this.router.navigate(['Foods/edit-food', id]);
  }

  addFood(): void {
    this.router.navigate(['Foods/add-food']);
  }

  deleteFood(id: number, name: string): void {
    this.confirm.confirm(`هل أنت متأكد من حذف المنتج "${name}"؟ لا يمكن التراجع.`, 'حذف المنتج')
      .subscribe((ok) => {
        if (!ok) return;
        this.productsService.deleteProduct(id).subscribe({
          next: () => {
            this.toast.success('تم حذف المنتج بنجاح');
            this.loadProducts();
          },
          error: () => this.toast.error('فشل حذف المنتج'),
        });
      });
  }

}
