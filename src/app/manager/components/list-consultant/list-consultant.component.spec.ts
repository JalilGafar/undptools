import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListConsultantComponent } from './list-consultant.component';

describe('ListConsultantComponent', () => {
  let component: ListConsultantComponent;
  let fixture: ComponentFixture<ListConsultantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListConsultantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListConsultantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
