import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddListSubComponent } from './add-list-sub.component';

describe('AddListSubComponent', () => {
  let component: AddListSubComponent;
  let fixture: ComponentFixture<AddListSubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddListSubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddListSubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
