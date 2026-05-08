import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T1bComponent } from './t1b.component';

describe('T1bComponent', () => {
  let component: T1bComponent;
  let fixture: ComponentFixture<T1bComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T1bComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T1bComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
