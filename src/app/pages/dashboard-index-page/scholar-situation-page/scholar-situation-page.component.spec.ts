import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScholarSituationPageComponent } from './scholar-situation-page.component';

describe('ScholarSituationPageComponent', () => {
  let component: ScholarSituationPageComponent;
  let fixture: ComponentFixture<ScholarSituationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScholarSituationPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScholarSituationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
