import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertConfirmationPopupComponent } from './alert-confirmation-popup.component';

describe('AlertConfirmationPopupComponent', () => {
  let component: AlertConfirmationPopupComponent;
  let fixture: ComponentFixture<AlertConfirmationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertConfirmationPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertConfirmationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
