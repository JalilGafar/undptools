import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T1dComponent } from './t1d.component';

describe('T1dComponent', () => {
  let component: T1dComponent;
  let fixture: ComponentFixture<T1dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T1dComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T1dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
