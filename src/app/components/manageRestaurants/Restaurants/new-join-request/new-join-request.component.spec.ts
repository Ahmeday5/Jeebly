import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewJoinRequestComponent } from './new-join-request.component';

describe('NewJoinRequestComponent', () => {
  let component: NewJoinRequestComponent;
  let fixture: ComponentFixture<NewJoinRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewJoinRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewJoinRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
