import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassAssigmentsPageComponent } from './class-assigments-page.component';

describe('ClassAssigmentsPageComponent', () => {
  let component: ClassAssigmentsPageComponent;
  let fixture: ComponentFixture<ClassAssigmentsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClassAssigmentsPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClassAssigmentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
