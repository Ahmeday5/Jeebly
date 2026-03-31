import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-sett-area',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sett-area.component.html',
  styleUrl: './sett-area.component.scss',
})
export class SettAreaComponent {
  showIncentiveForm: boolean = true; // متغير للتحكم بعرض فورم الحوافز

  // متغيرات رسوم التوصيل
  minDeliveryFee: number | null = null;
  maxDeliveryFee: number | null = null;
  maxCashOrder: number | null = null;
  increaseFeePercent: number | null = null;
  feePerKm: number | null = null;
  increaseFeeMessage: string = '';

  // متغيرات الحوافز
  dailyIncomeTarget: number | null = null;
  incentiveAmount: number | null = null;

  toggleIncentiveForm() {
    this.showIncentiveForm = false;
  }

  resetDeliveryFeesForm() {
    this.minDeliveryFee = null;
    this.maxDeliveryFee = null;
    this.maxCashOrder = null;
    this.increaseFeePercent = null;
    this.feePerKm = null;
    this.increaseFeeMessage = '';
  }

  resetIncentiveForm() {
    this.dailyIncomeTarget = null;
    this.incentiveAmount = null;
  }
}
