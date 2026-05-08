import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T2dComponent } from './t2d.component';

describe('T2dComponent', () => {
  let component: T2dComponent;
  let fixture: ComponentFixture<T2dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T2dComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T2dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
