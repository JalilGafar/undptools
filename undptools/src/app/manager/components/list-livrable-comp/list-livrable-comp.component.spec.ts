import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListLivrableCompComponent } from './list-livrable-comp.component';

describe('ListLivrableCompComponent', () => {
  let component: ListLivrableCompComponent;
  let fixture: ComponentFixture<ListLivrableCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListLivrableCompComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListLivrableCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
