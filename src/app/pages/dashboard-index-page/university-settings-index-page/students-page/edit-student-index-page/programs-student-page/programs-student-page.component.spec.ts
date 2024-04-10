import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramsStudentPageComponent } from './programs-student-page.component';

describe('ProgramsStudentPageComponent', () => {
  let component: ProgramsStudentPageComponent;
  let fixture: ComponentFixture<ProgramsStudentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgramsStudentPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgramsStudentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
