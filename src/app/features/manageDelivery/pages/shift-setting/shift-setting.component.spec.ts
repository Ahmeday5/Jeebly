import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftSettingComponent } from './shift-setting.component';

describe('ShiftSettingComponent', () => {
  let component: ShiftSettingComponent;
  let fixture: ComponentFixture<ShiftSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftSettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
