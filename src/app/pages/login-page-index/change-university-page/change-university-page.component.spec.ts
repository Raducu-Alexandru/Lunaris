import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeUniversityPageComponent } from './change-university-page.component';

describe('ChangeUniversityPageComponent', () => {
  let component: ChangeUniversityPageComponent;
  let fixture: ComponentFixture<ChangeUniversityPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangeUniversityPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeUniversityPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
