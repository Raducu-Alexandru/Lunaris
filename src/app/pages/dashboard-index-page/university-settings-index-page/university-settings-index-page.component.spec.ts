import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniversitySettingsIndexPageComponent } from './university-settings-index-page.component';

describe('UniversitySettingsIndexPageComponent', () => {
  let component: UniversitySettingsIndexPageComponent;
  let fixture: ComponentFixture<UniversitySettingsIndexPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UniversitySettingsIndexPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UniversitySettingsIndexPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
