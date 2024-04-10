import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStudentIndexPageComponent } from './edit-student-index-page.component';

describe('EditStudentIndexPageComponent', () => {
  let component: EditStudentIndexPageComponent;
  let fixture: ComponentFixture<EditStudentIndexPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditStudentIndexPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditStudentIndexPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
