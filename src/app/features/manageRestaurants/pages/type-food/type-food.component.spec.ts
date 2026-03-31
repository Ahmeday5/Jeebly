import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeFoodComponent } from './type-food.component';

describe('TypeFoodComponent', () => {
  let component: TypeFoodComponent;
  let fixture: ComponentFixture<TypeFoodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeFoodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeFoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
