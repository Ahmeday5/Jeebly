import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListfoodCampaignComponent } from './listfood-campaign.component';

describe('ListfoodCampaignComponent', () => {
  let component: ListfoodCampaignComponent;
  let fixture: ComponentFixture<ListfoodCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListfoodCampaignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListfoodCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
