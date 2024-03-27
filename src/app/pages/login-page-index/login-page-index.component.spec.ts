import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPageIndexComponent } from './login-page-index.component';

describe('LoginPageIndexComponent', () => {
  let component: LoginPageIndexComponent;
  let fixture: ComponentFixture<LoginPageIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginPageIndexComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginPageIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
