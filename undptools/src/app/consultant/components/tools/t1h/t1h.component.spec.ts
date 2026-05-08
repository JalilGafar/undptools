import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T1hComponent } from './t1h.component';

describe('T1hComponent', () => {
  let component: T1hComponent;
  let fixture: ComponentFixture<T1hComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T1hComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T1hComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
