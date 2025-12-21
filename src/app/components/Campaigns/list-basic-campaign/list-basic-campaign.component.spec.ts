import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBasicCampaignComponent } from './list-basic-campaign.component';

describe('ListBasicCampaignComponent', () => {
  let component: ListBasicCampaignComponent;
  let fixture: ComponentFixture<ListBasicCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListBasicCampaignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListBasicCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
