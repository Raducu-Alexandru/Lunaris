import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardIndexPageComponent } from './dashboard-index-page.component';

describe('DashboardIndexPageComponent', () => {
  let component: DashboardIndexPageComponent;
  let fixture: ComponentFixture<DashboardIndexPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardIndexPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardIndexPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
