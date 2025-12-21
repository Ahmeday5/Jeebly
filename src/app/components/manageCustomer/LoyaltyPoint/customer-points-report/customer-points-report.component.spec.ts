import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPointsReportComponent } from './customer-points-report.component';

describe('CustomerPointsReportComponent', () => {
  let component: CustomerPointsReportComponent;
  let fixture: ComponentFixture<CustomerPointsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPointsReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerPointsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
