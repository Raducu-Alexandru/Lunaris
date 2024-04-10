import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditYearPageComponent } from './edit-year-page.component';

describe('EditYearPageComponent', () => {
  let component: EditYearPageComponent;
  let fixture: ComponentFixture<EditYearPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditYearPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditYearPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
