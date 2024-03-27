import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAdminPageComponent } from './edit-admin-page.component';

describe('EditAdminPageComponent', () => {
  let component: EditAdminPageComponent;
  let fixture: ComponentFixture<EditAdminPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditAdminPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditAdminPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
