import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAdComponent } from './new-ad.component';

describe('NewAdComponent', () => {
  let component: NewAdComponent;
  let fixture: ComponentFixture<NewAdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
