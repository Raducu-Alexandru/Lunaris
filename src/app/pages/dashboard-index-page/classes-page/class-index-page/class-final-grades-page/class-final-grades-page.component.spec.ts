import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassFinalGradesPageComponent } from './class-final-grades-page.component';

describe('ClassFinalGradesPageComponent', () => {
  let component: ClassFinalGradesPageComponent;
  let fixture: ComponentFixture<ClassFinalGradesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClassFinalGradesPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClassFinalGradesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
