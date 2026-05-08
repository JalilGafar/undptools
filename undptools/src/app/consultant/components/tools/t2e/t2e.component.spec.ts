import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T2eComponent } from './t2e.component';

describe('T2eComponent', () => {
  let component: T2eComponent;
  let fixture: ComponentFixture<T2eComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T2eComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T2eComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
