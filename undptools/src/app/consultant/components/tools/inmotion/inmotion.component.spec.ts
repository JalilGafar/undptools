import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InmotionComponent } from './inmotion.component';

describe('InmotionComponent', () => {
  let component: InmotionComponent;
  let fixture: ComponentFixture<InmotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InmotionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InmotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
