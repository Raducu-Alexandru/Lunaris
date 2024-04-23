import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardWithDateComponent } from './card-with-date.component';

describe('CardWithDateComponent', () => {
  let component: CardWithDateComponent;
  let fixture: ComponentFixture<CardWithDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardWithDateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardWithDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
