import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettAreaComponent } from './sett-area.component';

describe('SettAreaComponent', () => {
  let component: SettAreaComponent;
  let fixture: ComponentFixture<SettAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
