import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutOfBoxComponent } from './out-of-box.component';

describe('OutOfBoxComponent', () => {
  let component: OutOfBoxComponent;
  let fixture: ComponentFixture<OutOfBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OutOfBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OutOfBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
