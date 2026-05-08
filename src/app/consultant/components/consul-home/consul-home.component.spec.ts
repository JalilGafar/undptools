import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsulHomeComponent } from './consul-home.component';

describe('ConsulHomeComponent', () => {
  let component: ConsulHomeComponent;
  let fixture: ComponentFixture<ConsulHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsulHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsulHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
