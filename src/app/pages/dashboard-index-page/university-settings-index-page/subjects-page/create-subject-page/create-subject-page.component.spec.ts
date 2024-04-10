import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSubjectPageComponent } from './create-subject-page.component';

describe('CreateSubjectPageComponent', () => {
  let component: CreateSubjectPageComponent;
  let fixture: ComponentFixture<CreateSubjectPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateSubjectPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateSubjectPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
