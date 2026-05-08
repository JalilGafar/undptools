import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T1cComponent } from './t1c.component';

describe('T1cComponent', () => {
  let component: T1cComponent;
  let fixture: ComponentFixture<T1cComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T1cComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T1cComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
