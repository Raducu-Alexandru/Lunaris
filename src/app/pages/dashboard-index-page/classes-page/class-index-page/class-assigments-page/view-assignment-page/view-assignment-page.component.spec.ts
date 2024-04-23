import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssignmentPageComponent } from './view-assignment-page.component';

describe('ViewAssignmentPageComponent', () => {
  let component: ViewAssignmentPageComponent;
  let fixture: ComponentFixture<ViewAssignmentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewAssignmentPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAssignmentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
