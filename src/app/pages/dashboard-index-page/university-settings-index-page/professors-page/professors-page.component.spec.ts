import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessorsPageComponent } from './professors-page.component';

describe('ProfessorsPageComponent', () => {
  let component: ProfessorsPageComponent;
  let fixture: ComponentFixture<ProfessorsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfessorsPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfessorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
