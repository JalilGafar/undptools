import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManHeaderComponent } from './man-header.component';

describe('ManHeaderComponent', () => {
  let component: ManHeaderComponent;
  let fixture: ComponentFixture<ManHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
