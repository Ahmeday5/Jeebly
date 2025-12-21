import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationFoodComponent } from './evaluation-food.component';

describe('EvaluationFoodComponent', () => {
  let component: EvaluationFoodComponent;
  let fixture: ComponentFixture<EvaluationFoodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationFoodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationFoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
