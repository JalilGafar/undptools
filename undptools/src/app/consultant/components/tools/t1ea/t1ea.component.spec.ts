import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T1eaComponent } from './t1ea.component';

describe('T1eaComponent', () => {
  let component: T1eaComponent;
  let fixture: ComponentFixture<T1eaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T1eaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T1eaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
