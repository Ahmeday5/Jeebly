import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddfoodCampaignComponent } from './addfood-campaign.component';

describe('AddfoodCampaignComponent', () => {
  let component: AddfoodCampaignComponent;
  let fixture: ComponentFixture<AddfoodCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddfoodCampaignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddfoodCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
