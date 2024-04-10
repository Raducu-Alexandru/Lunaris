import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewStudyYearPageComponent } from './new-study-year-page.component';

describe('NewStudyYearPageComponent', () => {
  let component: NewStudyYearPageComponent;
  let fixture: ComponentFixture<NewStudyYearPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewStudyYearPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewStudyYearPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
