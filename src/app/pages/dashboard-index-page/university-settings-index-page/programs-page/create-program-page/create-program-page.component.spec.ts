import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProgramPageComponent } from './create-program-page.component';

describe('CreateProgramPageComponent', () => {
  let component: CreateProgramPageComponent;
  let fixture: ComponentFixture<CreateProgramPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateProgramPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateProgramPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
