import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltestComponent } from './tooltest.component';

describe('TooltestComponent', () => {
  let component: TooltestComponent;
  let fixture: ComponentFixture<TooltestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TooltestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
