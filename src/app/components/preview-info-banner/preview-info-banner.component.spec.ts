import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewInfoBannerComponent } from './preview-info-banner.component';

describe('PreviewInfoBannerComponent', () => {
  let component: PreviewInfoBannerComponent;
  let fixture: ComponentFixture<PreviewInfoBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreviewInfoBannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviewInfoBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
