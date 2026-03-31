import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBasicCampaignComponent } from './add-basic-campaign.component';

describe('AddBasicCampaignComponent', () => {
  let component: AddBasicCampaignComponent;
  let fixture: ComponentFixture<AddBasicCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBasicCampaignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBasicCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
