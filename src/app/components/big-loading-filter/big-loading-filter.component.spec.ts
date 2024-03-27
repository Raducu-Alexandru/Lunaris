import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigLoadingFilterComponent } from './big-loading-filter.component';

describe('BigLoadingFilterComponent', () => {
  let component: BigLoadingFilterComponent;
  let fixture: ComponentFixture<BigLoadingFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BigLoadingFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BigLoadingFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
