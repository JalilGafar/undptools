import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { LivrableTypesComponent } from './livrable-types.component';
import { ManagerService } from '../../manager.service';
import { LivrableGlobal } from '../../../core/model/livrable-global';

describe('LivrableTypesComponent', () => {
  let component: LivrableTypesComponent;
  let fixture: ComponentFixture<LivrableTypesComponent>;
  let managerServiceSpy: jasmine.SpyObj<ManagerService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockLivrables: LivrableGlobal[] = [
    { tool_code: 'attribut', company: 'A', consultant: 'x', comp_id: 1, cons_id: 1, date: '', updated_at: '', livrable: '', tableur: '', id_livrable: 1 } as LivrableGlobal,
    { tool_code: 'attribut', company: 'B', consultant: 'y', comp_id: 2, cons_id: 2, date: '', updated_at: '', livrable: '', tableur: '', id_livrable: 2 } as LivrableGlobal,
    { tool_code: 't1d', company: 'C', consultant: 'z', comp_id: 3, cons_id: 3, date: '', updated_at: '', livrable: '', tableur: '', id_livrable: 3 } as LivrableGlobal,
  ];

  beforeEach(async () => {
    managerServiceSpy = jasmine.createSpyObj('ManagerService', ['getAllLivrables'], {
      allLivrables$: of(mockLivrables),
    });
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [LivrableTypesComponent],
      providers: [
        { provide: ManagerService, useValue: managerServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LivrableTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('countByType should count only matching tool_code entries', () => {
    expect(component.countByType(mockLivrables, 'attribut')).toBe(2);
    expect(component.countByType(mockLivrables, 't1d')).toBe(1);
    expect(component.countByType(mockLivrables, 'unknown')).toBe(0);
  });

  it('goToType should navigate to the per-type table route', () => {
    component.goToType('t1d');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('manager/all-livrables/t1d');
  });
});
