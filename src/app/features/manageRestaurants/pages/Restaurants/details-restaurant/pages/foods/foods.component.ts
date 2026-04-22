import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../../../../Foods/services/list-food.service';
import { RestaurantProduct } from '../../../../../../Foods/model/food.type';
import { ToastService } from '../../../../../../../core/services/toast.service';
import { ConfirmService } from '../../../../../../../core/services/confirm.service';
import { environment } from '../../../../../../../../environments/environment';

@Component({
  selector: 'app-foods',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './foods.component.html',
  styleUrl: './foods.component.scss',
})
export class FoodsComponent implements OnInit {
  products: RestaurantProduct[] = [];
  isLoading = false;
  restaurantId!: number;
  readonly baseUrl = environment.apiBaseUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private toast: ToastService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.restaurantId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productsService.getRestaurantProducts(this.restaurantId).subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('فشل تحميل منتجات المطعم');
        this.isLoading = false;
      },
    });
  }

  addFood(): void {
    this.router.navigate(['/Foods/add-food'], { queryParams: { restaurantId: this.restaurantId } });
  }

  editFood(id: number): void {
    this.router.navigate(['/Foods/edit-food', id]);
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
