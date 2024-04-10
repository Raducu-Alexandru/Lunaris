import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScholarSituationStudentPageComponent } from './scholar-situation-student-page.component';

describe('ScholarSituationStudentPageComponent', () => {
  let component: ScholarSituationStudentPageComponent;
  let fixture: ComponentFixture<ScholarSituationStudentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScholarSituationStudentPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScholarSituationStudentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
