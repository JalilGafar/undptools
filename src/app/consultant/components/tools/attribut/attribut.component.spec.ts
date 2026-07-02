import { TestBed } from '@angular/core/testing';
import { AttributComponent } from './attribut.component';
import { AttribPdfService } from './attrib-pdf.service';
import { ConsultantService } from '../../../consultant.service';
import { StorageService } from '../../../../_services/storage.service';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { ToolAttrib } from '../../../../core/model/toolAttrib';
import { PrediaLabel } from '../../../../core/model/predia_mat_label';

describe('AttributComponent – downloadPdf', () => {
  let component: AttributComponent;
  let pdfSpy: jasmine.SpyObj<AttribPdfService>;

  beforeEach(async () => {
    pdfSpy = jasmine.createSpyObj<AttribPdfService>('AttribPdfService', ['generate']);
    pdfSpy.generate.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [AttributComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ConsultantService,
        StorageService,
        { provide: AttribPdfService, useValue: pdfSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AttributComponent);
    component = fixture.componentInstance;
  });

  it('calls pdfService.generate with first item and current scores', () => {
    const mockData = { gen_nom_entreprise: 'Test SARL' } as ToolAttrib;
    component.matAttribData  = [mockData];
    component.matPrediaLabel = [] as PrediaLabel[];
    component.crit_1     = 50;
    component.crit_2     = 70;
    component.crit_3     = 60;
    component.crit_4     = 80;
    component.crit_5     = 40;
    component.eval_total = 6.5;

    component.downloadPdf();

    expect(pdfSpy.generate).toHaveBeenCalledOnceWith(
      mockData,
      [],
      { crit_1: 50, crit_2: 70, crit_3: 60, crit_4: 80, crit_5: 40, eval_total: 6.5 }
    );
  });

  it('does nothing when matAttribData is empty', () => {
    component.matAttribData = [];
    component.downloadPdf();
    expect(pdfSpy.generate).not.toHaveBeenCalled();
  });
});
