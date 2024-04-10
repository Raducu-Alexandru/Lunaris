import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSubjectPageComponent } from './edit-subject-page.component';

describe('EditSubjectPageComponent', () => {
  let component: EditSubjectPageComponent;
  let fixture: ComponentFixture<EditSubjectPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditSubjectPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditSubjectPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
