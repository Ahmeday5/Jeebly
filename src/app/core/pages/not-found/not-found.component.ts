import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="nf-wrap" dir="rtl">
      <div class="nf-card">
        <div class="nf-code">404</div>
        <h1 class="nf-title">الصفحة غير موجودة</h1>
        <p class="nf-text">الرابط الذي حاولت الوصول إليه غير صحيح أو تم نقله.</p>
        <div class="nf-actions">
          <button type="button" class="btn-secondary" (click)="goBack()">
            <i class="fas fa-arrow-right"></i> رجوع
          </button>
          <a routerLink="/dashboard" class="btn-primary">
            <i class="fas fa-home"></i> الرئيسية
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .nf-wrap {
      min-height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .nf-card {
      text-align: center;
      max-width: 480px;
      padding: 2.5rem 2rem;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 6px 24px rgba(0,0,0,.06);
    }
    .nf-code {
      font-size: 6rem;
      font-weight: 800;
      line-height: 1;
      color: var(--main-color, #ff6b00);
      letter-spacing: -2px;
    }
    .nf-title {
      margin: .75rem 0 .5rem;
      font-size: 1.5rem;
      color: #1f2937;
    }
    .nf-text {
      color: #6b7280;
      margin-bottom: 1.75rem;
    }
    .nf-actions {
      display: flex;
      gap: .75rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-primary, .btn-secondary {
      border: 0;
      padding: .65rem 1.4rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      transition: transform .15s ease, box-shadow .15s ease;
    }
    .btn-primary {
      background: var(--main-color, #ff6b00);
      color: #fff;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(255,107,0,.3); }
    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }
    .btn-secondary:hover { background: #e5e7eb; }
  `],
})
export class NotFoundComponent {
  constructor(private readonly location: Location) {}
  goBack(): void { this.location.back(); }
}
