import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassIndexPageComponent } from './class-index-page.component';

describe('ClassIndexPageComponent', () => {
  let component: ClassIndexPageComponent;
  let fixture: ComponentFixture<ClassIndexPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClassIndexPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClassIndexPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
