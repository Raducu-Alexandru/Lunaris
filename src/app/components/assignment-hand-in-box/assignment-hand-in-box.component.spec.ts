import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentHandInBoxComponent } from './assignment-hand-in-box.component';

describe('AssignmentHandInBoxComponent', () => {
  let component: AssignmentHandInBoxComponent;
  let fixture: ComponentFixture<AssignmentHandInBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignmentHandInBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignmentHandInBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
