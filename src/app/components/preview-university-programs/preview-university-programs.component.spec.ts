import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewUniversityProgramsComponent } from './preview-university-programs.component';

describe('PreviewUniversityProgramsComponent', () => {
  let component: PreviewUniversityProgramsComponent;
  let fixture: ComponentFixture<PreviewUniversityProgramsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreviewUniversityProgramsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviewUniversityProgramsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
