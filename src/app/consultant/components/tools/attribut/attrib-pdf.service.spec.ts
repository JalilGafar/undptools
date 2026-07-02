import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AttribPdfService, PdfScores } from './attrib-pdf.service';
import { ToolAttrib } from '../../../../core/model/toolAttrib';
import { PrediaLabel } from '../../../../core/model/predia_mat_label';

describe('AttribPdfService', () => {
  let service: AttribPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AttribPdfService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(AttribPdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- getColor tests ---
  describe('getColor', () => {
    it('should return red for value 0', () => {
      const color = (service as unknown as Record<string, (...args: unknown[]) => unknown>)['getColor'](0);
      expect(color).toEqual([220, 53, 69]);
    });

    it('should return red for value 2', () => {
      const color = (service as unknown as Record<string, (...args: unknown[]) => unknown>)['getColor'](2);
      expect(color).toEqual([220, 53, 69]);
    });

    it('should return orange for value 3', () => {
      const color = (service as unknown as Record<string, (...args: unknown[]) => unknown>)['getColor'](3);
      expect(color).toEqual([253, 126, 20]);
    });

    it('should return orange for value 7', () => {
      const color = (service as unknown as Record<string, (...args: unknown[]) => unknown>)['getColor'](7);
      expect(color).toEqual([253, 126, 20]);
    });

    it('should return green for value 8', () => {
      const color = (service as unknown as Record<string, (...args: unknown[]) => unknown>)['getColor'](8);
      expect(color).toEqual([40, 167, 69]);
    });

    it('should return green for value 10', () => {
      const color = (service as unknown as Record<string, (...args: unknown[]) => unknown>)['getColor'](10);
      expect(color).toEqual([40, 167, 69]);
    });
  });

  // --- buildFilename tests ---
  describe('buildFilename', () => {
    it('should build a sanitized filename from a normal company name and date', () => {
      const filename = (service as unknown as Record<string, (...args: unknown[]) => unknown>)['buildFilename']('ACME SARL', '27/06/2026');
      expect(filename).toBe('rapport-prediagnostic-acme-sarl-27-06-2026.pdf');
    });

    it('should fallback to "entreprise" when company name is empty', () => {
      const filename = (service as unknown as Record<string, (...args: unknown[]) => unknown>)['buildFilename']('', '27/06/2026');
      expect(filename).toBe('rapport-prediagnostic-entreprise-27-06-2026.pdf');
    });

    it('should sanitize special characters in company name', () => {
      const filename = (service as unknown as Record<string, (...args: unknown[]) => unknown>)['buildFilename']('Café & Cie!', '27/06/2026');
      expect(filename).toBe('rapport-prediagnostic-caf-cie-27-06-2026.pdf');
    });
  });

  // --- generate tests ---
  describe('generate', () => {
    it('should return immediately without generating PDF on server platform', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AttribPdfService,
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      const serverService: AttribPdfService = TestBed.inject(AttribPdfService);

      const data = new ToolAttrib();
      const labels: PrediaLabel[] = [];
      const scores: PdfScores = {
        crit_1: 5, crit_2: 5, crit_3: 5,
        crit_4: 5, crit_5: 5, eval_total: 50
      };

      // Should resolve immediately without throwing (no jsPDF import on server)
      await expectAsync(serverService.generate(data, labels, scores)).toBeResolved();
    });
  });
});
