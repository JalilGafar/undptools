import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManDashbordComponent } from './man-dashbord.component';

describe('ManDashbordComponent', () => {
  let component: ManDashbordComponent;
  let fixture: ComponentFixture<ManDashbordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManDashbordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManDashbordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
