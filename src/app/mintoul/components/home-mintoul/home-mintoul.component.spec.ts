import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeMintoulComponent } from './home-mintoul.component';

describe('HomeMintoulComponent', () => {
  let component: HomeMintoulComponent;
  let fixture: ComponentFixture<HomeMintoulComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeMintoulComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeMintoulComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
