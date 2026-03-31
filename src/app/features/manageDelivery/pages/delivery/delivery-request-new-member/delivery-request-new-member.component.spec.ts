import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryRequestNewMemberComponent } from './delivery-request-new-member.component';

describe('DeliveryRequestNewMemberComponent', () => {
  let component: DeliveryRequestNewMemberComponent;
  let fixture: ComponentFixture<DeliveryRequestNewMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryRequestNewMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryRequestNewMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
