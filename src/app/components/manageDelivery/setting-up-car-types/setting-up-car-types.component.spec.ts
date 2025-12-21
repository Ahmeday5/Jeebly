import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingUpCarTypesComponent } from './setting-up-car-types.component';

describe('SettingUpCarTypesComponent', () => {
  let component: SettingUpCarTypesComponent;
  let fixture: ComponentFixture<SettingUpCarTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingUpCarTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingUpCarTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
