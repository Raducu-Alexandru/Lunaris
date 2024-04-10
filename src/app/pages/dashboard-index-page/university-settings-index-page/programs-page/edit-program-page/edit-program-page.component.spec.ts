import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProgramPageComponent } from './edit-program-page.component';

describe('EditProgramPageComponent', () => {
  let component: EditProgramPageComponent;
  let fixture: ComponentFixture<EditProgramPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditProgramPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditProgramPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
