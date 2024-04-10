import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownSelectPopupComponent } from './dropdown-select-popup.component';

describe('DropdownSelectPopupComponent', () => {
  let component: DropdownSelectPopupComponent;
  let fixture: ComponentFixture<DropdownSelectPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DropdownSelectPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DropdownSelectPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
