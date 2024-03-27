import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextInputPopupComponent } from './text-input-popup.component';

describe('TextInputPopupComponent', () => {
  let component: TextInputPopupComponent;
  let fixture: ComponentFixture<TextInputPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextInputPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TextInputPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
