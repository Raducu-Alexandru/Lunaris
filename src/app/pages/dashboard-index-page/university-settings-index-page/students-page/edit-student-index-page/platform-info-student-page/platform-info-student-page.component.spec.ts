import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformInfoStudentPageComponent } from './platform-info-student-page.component';

describe('PlatformInfoStudentPageComponent', () => {
  let component: PlatformInfoStudentPageComponent;
  let fixture: ComponentFixture<PlatformInfoStudentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlatformInfoStudentPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlatformInfoStudentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
