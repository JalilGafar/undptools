import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneConsultantComponent } from './one-consultant.component';

describe('OneConsultantComponent', () => {
  let component: OneConsultantComponent;
  let fixture: ComponentFixture<OneConsultantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OneConsultantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OneConsultantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
