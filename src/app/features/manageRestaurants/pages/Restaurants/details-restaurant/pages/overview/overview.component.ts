import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Restaurant } from '../../../../../model/restaurant.type';
import { environment } from '../../../../../../../../environments/environment';
import { RestaurantsService } from '../../../../../services/restaurants.service';
import { ToastService } from '../../../../../../../core/services/toast.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements OnInit {
  private readonly baseUrl: string = environment.apiBaseUrl;
  LogoPreview: SafeUrl | null = null;
  CoverPreview: SafeUrl | null = null;
  Logo: File | null = null;
  Cover: File | null = null;
  restaurant: any | null = null;
  Loading: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    private apiService: RestaurantsService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const idParam = Number(this.route.parent?.snapshot.paramMap.get('id'));
    if (!idParam) {
      this.toast.error('لم يتم تحديد المطعم');
      return;
    }

    const id = Number(idParam);
    if (isNaN(id)) {
      this.toast.error('معرف غير صالح');
      return;
    }

    this.loadRestaurant(id);
  }

  loadRestaurant(id: number): void {
    this.Loading = true;
    this.apiService.getRestaurantById(id).subscribe({
      next: (res) => {
        this.restaurant = res;
        console.log(this.restaurant);

        // الصور
        if (res.logo) {
          this.LogoPreview = this.sanitizer.bypassSecurityTrustUrl(
            this.baseUrl + res.logo,
          );
        }

        if (res.coverUrl) {
          this.CoverPreview = this.sanitizer.bypassSecurityTrustUrl(
            this.baseUrl + res.coverUrl,
          );
        }

        this.Loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error('فشل جلب البيانات');
        this.Loading = false;
      },
    });
  }

  getImageUrl(path: string | null | undefined): string {
    if (!path) return '';

    return `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}
