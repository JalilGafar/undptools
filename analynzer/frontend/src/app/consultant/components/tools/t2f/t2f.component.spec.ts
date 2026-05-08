import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T2fComponent } from './t2f.component';

describe('T2fComponent', () => {
  let component: T2fComponent;
  let fixture: ComponentFixture<T2fComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T2fComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T2fComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
