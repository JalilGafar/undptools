import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T1aComponent } from './t1a.component';

describe('T1aComponent', () => {
  let component: T1aComponent;
  let fixture: ComponentFixture<T1aComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T1aComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T1aComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
