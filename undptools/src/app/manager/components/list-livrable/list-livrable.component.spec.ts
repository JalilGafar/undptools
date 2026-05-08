import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListLivrableComponent } from './list-livrable.component';

describe('ListLivrableComponent', () => {
  let component: ListLivrableComponent;
  let fixture: ComponentFixture<ListLivrableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListLivrableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListLivrableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
