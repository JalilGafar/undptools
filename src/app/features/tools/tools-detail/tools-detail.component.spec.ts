import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolsDetailComponent } from './tools-detail.component';

describe('ToolsDetailComponent', () => {
  let component: ToolsDetailComponent;
  let fixture: ComponentFixture<ToolsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolsDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
