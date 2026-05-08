import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T2cComponent } from './t2c.component';

describe('T2cComponent', () => {
  let component: T2cComponent;
  let fixture: ComponentFixture<T2cComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T2cComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T2cComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
