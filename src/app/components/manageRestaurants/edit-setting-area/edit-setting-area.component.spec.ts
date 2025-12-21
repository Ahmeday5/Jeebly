import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSettingAreaComponent } from './edit-setting-area.component';

describe('EditSettingAreaComponent', () => {
  let component: EditSettingAreaComponent;
  let fixture: ComponentFixture<EditSettingAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSettingAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSettingAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
