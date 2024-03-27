import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoBackTextComponent } from './go-back-text.component';

describe('GoBackTextComponent', () => {
  let component: GoBackTextComponent;
  let fixture: ComponentFixture<GoBackTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GoBackTextComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoBackTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
