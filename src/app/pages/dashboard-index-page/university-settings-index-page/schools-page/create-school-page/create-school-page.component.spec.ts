import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSchoolPageComponent } from './create-school-page.component';

describe('CreateSchoolPageComponent', () => {
  let component: CreateSchoolPageComponent;
  let fixture: ComponentFixture<CreateSchoolPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateSchoolPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateSchoolPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
