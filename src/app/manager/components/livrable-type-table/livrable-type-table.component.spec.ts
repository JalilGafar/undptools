import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { LivrableTypeTableComponent } from './livrable-type-table.component';
import { ManagerService } from '../../manager.service';
import { StorageService } from '../../../_services/storage.service';
import { LivrableGlobal } from '../../../core/model/livrable-global';

describe('LivrableTypeTableComponent', () => {
  let component: LivrableTypeTableComponent;
  let fixture: ComponentFixture<LivrableTypeTableComponent>;
  let managerServiceSpy: jasmine.SpyObj<ManagerService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockLivrables: LivrableGlobal[] = [
    { tool_code: 'attribut', company: 'A', consultant: 'x', comp_id: 1, cons_id: 11, date: '2026-01-01', updated_at: '2026-01-02', livrable: 'Prédiagnostic', tableur: '', id_livrable: 1 } as LivrableGlobal,
    { tool_code: 't1d', company: 'B', consultant: 'y', comp_id: 2, cons_id: 22, date: '2026-01-03', updated_at: '2026-01-04', livrable: 'Diagnostic intégral', tableur: '', id_livrable: 2 } as LivrableGlobal,
  ];

  beforeEach(async () => {
    managerServiceSpy = jasmine.createSpyObj('ManagerService', ['getAllLivrables'], {
      allLivrables$: of(mockLivrables),
    });
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['setIdComp', 'setIdConsultant']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [LivrableTypeTableComponent],
      providers: [
        { provide: ManagerService, useValue: managerServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ type: 'attribut' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LivrableTypeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter livrables$ to only the route type and set the label', (done) => {
    expect(component.typeLabel).toBe('Prédiagnostic');
    component.livrables$.subscribe(data => {
      expect(data.length).toBe(1);
      expect(data[0].tool_code).toBe('attribut');
      done();
    });
  });

  it('viewLivrable should set storage IDs and navigate to the tool route', () => {
    component.viewLivrable(mockLivrables[1]);
    expect(storageServiceSpy.setIdComp).toHaveBeenCalledWith(2);
    expect(storageServiceSpy.setIdConsultant).toHaveBeenCalledWith(22);
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('consultant/tool/t1d');
  });
});
