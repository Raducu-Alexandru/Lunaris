import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckmarkPopupComponent } from './checkmark-popup.component';

describe('CheckmarkPopupComponent', () => {
  let component: CheckmarkPopupComponent;
  let fixture: ComponentFixture<CheckmarkPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckmarkPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckmarkPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
