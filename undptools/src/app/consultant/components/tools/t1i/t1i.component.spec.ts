import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T1iComponent } from './t1i.component';

describe('T1iComponent', () => {
  let component: T1iComponent;
  let fixture: ComponentFixture<T1iComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T1iComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T1iComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
