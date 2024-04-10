import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyYearDropdownComponent } from './study-year-dropdown.component';

describe('StudyYearDropdownComponent', () => {
  let component: StudyYearDropdownComponent;
  let fixture: ComponentFixture<StudyYearDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudyYearDropdownComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudyYearDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
