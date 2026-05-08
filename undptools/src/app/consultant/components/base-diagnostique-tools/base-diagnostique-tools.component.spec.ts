import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseDiagnostiqueToolsComponent } from './base-diagnostique-tools.component';

describe('BaseDiagnostiqueToolsComponent', () => {
  let component: BaseDiagnostiqueToolsComponent;
  let fixture: ComponentFixture<BaseDiagnostiqueToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseDiagnostiqueToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseDiagnostiqueToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
