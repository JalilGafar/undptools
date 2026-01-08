import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnconstructionComponent } from './onconstruction.component';

describe('OnconstructionComponent', () => {
  let component: OnconstructionComponent;
  let fixture: ComponentFixture<OnconstructionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnconstructionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnconstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
