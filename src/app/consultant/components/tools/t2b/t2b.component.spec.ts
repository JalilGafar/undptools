import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T2bComponent } from './t2b.component';

describe('T2bComponent', () => {
  let component: T2bComponent;
  let fixture: ComponentFixture<T2bComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T2bComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T2bComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
