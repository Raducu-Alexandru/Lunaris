import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassHomePageComponent } from './class-home-page.component';

describe('ClassHomePageComponent', () => {
  let component: ClassHomePageComponent;
  let fixture: ComponentFixture<ClassHomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClassHomePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClassHomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
