import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSchoolPageComponent } from './edit-school-page.component';

describe('EditSchoolPageComponent', () => {
  let component: EditSchoolPageComponent;
  let fixture: ComponentFixture<EditSchoolPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditSchoolPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditSchoolPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
