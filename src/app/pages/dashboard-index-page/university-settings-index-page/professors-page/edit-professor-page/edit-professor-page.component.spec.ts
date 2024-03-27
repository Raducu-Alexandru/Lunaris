import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfessorPageComponent } from './edit-professor-page.component';

describe('EditProfessorPageComponent', () => {
  let component: EditProfessorPageComponent;
  let fixture: ComponentFixture<EditProfessorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditProfessorPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditProfessorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
