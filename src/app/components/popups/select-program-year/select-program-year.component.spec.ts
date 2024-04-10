import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAddProgramComponent } from './student-add-program.component';

describe('StudentAddProgramComponent', () => {
  let component: StudentAddProgramComponent;
  let fixture: ComponentFixture<StudentAddProgramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentAddProgramComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentAddProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
