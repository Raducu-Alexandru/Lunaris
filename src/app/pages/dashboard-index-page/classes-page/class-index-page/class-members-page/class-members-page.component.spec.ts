import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassMembersPageComponent } from './class-members-page.component';

describe('ClassMembersPageComponent', () => {
  let component: ClassMembersPageComponent;
  let fixture: ComponentFixture<ClassMembersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClassMembersPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClassMembersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
