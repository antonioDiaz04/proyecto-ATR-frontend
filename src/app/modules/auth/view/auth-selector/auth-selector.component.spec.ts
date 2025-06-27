import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSelectorComponent } from './auth-selector.component';

describe('AuthSelectorComponent', () => {
  let component: AuthSelectorComponent;
  let fixture: ComponentFixture<AuthSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
