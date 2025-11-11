import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkModalComponent } from './network-modal.component';

describe('NetworkModalComponent', () => {
  let component: NetworkModalComponent;
  let fixture: ComponentFixture<NetworkModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
