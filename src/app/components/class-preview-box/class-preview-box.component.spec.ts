import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassPreviewBoxComponent } from './class-preview-box.component';

describe('ClassPreviewBoxComponent', () => {
  let component: ClassPreviewBoxComponent;
  let fixture: ComponentFixture<ClassPreviewBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClassPreviewBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClassPreviewBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
