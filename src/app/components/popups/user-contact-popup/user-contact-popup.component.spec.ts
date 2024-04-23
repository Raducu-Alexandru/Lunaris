import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserContactPopupComponent } from './user-contact-popup.component';

describe('UserContactPopupComponent', () => {
  let component: UserContactPopupComponent;
  let fixture: ComponentFixture<UserContactPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserContactPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserContactPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
