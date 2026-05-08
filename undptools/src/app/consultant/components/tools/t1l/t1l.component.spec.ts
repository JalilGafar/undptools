import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T1lComponent } from './t1l.component';

describe('T1lComponent', () => {
  let component: T1lComponent;
  let fixture: ComponentFixture<T1lComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T1lComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T1lComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
