import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdtiFoodComponent } from './edti-food.component';

describe('EdtiFoodComponent', () => {
  let component: EdtiFoodComponent;
  let fixture: ComponentFixture<EdtiFoodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdtiFoodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdtiFoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
