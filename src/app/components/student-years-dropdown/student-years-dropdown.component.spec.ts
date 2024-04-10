import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentYearsDropdownComponent } from './student-years-dropdown.component';

describe('StudentYearsDropdownComponent', () => {
  let component: StudentYearsDropdownComponent;
  let fixture: ComponentFixture<StudentYearsDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentYearsDropdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentYearsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
