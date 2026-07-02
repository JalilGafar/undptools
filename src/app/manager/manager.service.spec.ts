import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManagerService } from './manager.service';
import { LivrableGlobal } from '../core/model/livrable-global';
import { environment } from '../../environment/environment';

describe('ManagerService', () => {
  let service: ManagerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ManagerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAllLivrables() should fetch and push into allLivrables$', () => {
    const mockData: LivrableGlobal[] = [
      { livrable: 'Prédiagnostic', tableur: 'mat_predia_crev_note', tool_code: 'attribut', id_livrable: 1, comp_id: 10, company: 'ACME', cons_id: 5, consultant: 'jdupont', date: '2026-01-01', updated_at: '2026-01-02' } as LivrableGlobal,
    ];

    let received: LivrableGlobal[] = [];
    service.allLivrables$.subscribe(data => received = data);

    service.getAllLivrables();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/manager/all-livrables`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);

    expect(received).toEqual(mockData);
  });
});
