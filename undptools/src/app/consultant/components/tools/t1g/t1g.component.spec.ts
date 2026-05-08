import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T1gComponent } from './t1g.component';

describe('T1gComponent', () => {
  let component: T1gComponent;
  let fixture: ComponentFixture<T1gComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T1gComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T1gComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
