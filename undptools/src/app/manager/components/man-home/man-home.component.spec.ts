import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManHomeComponent } from './man-home.component';

describe('ManHomeComponent', () => {
  let component: ManHomeComponent;
  let fixture: ComponentFixture<ManHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
