import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T2aComponent } from './t2a.component';

describe('T2aComponent', () => {
  let component: T2aComponent;
  let fixture: ComponentFixture<T2aComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T2aComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T2aComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
