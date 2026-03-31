import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersRestComponent } from './orders-rest.component';

describe('OrdersRestComponent', () => {
  let component: OrdersRestComponent;
  let fixture: ComponentFixture<OrdersRestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersRestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersRestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
