import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributComponent } from './attribut.component';

describe('AttributComponent', () => {
  let component: AttributComponent;
  let fixture: ComponentFixture<AttributComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttributComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
