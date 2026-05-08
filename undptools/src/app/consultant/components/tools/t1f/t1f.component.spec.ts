import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T1fComponent } from './t1f.component';

describe('T1fComponent', () => {
  let component: T1fComponent;
  let fixture: ComponentFixture<T1fComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T1fComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T1fComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
