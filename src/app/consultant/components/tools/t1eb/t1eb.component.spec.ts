import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T1ebComponent } from './t1eb.component';

describe('T1ebComponent', () => {
  let component: T1ebComponent;
  let fixture: ComponentFixture<T1ebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T1ebComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T1ebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
