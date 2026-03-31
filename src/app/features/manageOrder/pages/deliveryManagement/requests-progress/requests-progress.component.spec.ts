import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsProgressComponent } from './requests-progress.component';

describe('RequestsProgressComponent', () => {
  let component: RequestsProgressComponent;
  let fixture: ComponentFixture<RequestsProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestsProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestsProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
