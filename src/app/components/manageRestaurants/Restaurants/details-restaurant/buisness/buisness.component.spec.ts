import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuisnessComponent } from './buisness.component';

describe('BuisnessComponent', () => {
  let component: BuisnessComponent;
  let fixture: ComponentFixture<BuisnessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuisnessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuisnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
