import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfSharedEmailsComponent } from './list-of-shared-emails.component';

describe('ListOfSharedEmailsComponent', () => {
  let component: ListOfSharedEmailsComponent;
  let fixture: ComponentFixture<ListOfSharedEmailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOfSharedEmailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOfSharedEmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
