import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberInputPopupComponent } from './number-input-popup.component';

describe('NumberInputPopupComponent', () => {
  let component: NumberInputPopupComponent;
  let fixture: ComponentFixture<NumberInputPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NumberInputPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NumberInputPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
