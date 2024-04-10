import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProgramYearComponent } from './create-program-year.component';

describe('CreateProgramYearComponent', () => {
  let component: CreateProgramYearComponent;
  let fixture: ComponentFixture<CreateProgramYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateProgramYearComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateProgramYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
