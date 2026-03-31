import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingAreasComponent } from './setting-areas.component';

describe('SettingAreasComponent', () => {
  let component: SettingAreasComponent;
  let fixture: ComponentFixture<SettingAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingAreasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
