import { ComponentFixture, TestBed } from '@angular/core/testing';

import { T2gComponent } from './t2g.component';

describe('T2gComponent', () => {
  let component: T2gComponent;
  let fixture: ComponentFixture<T2gComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [T2gComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(T2gComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
