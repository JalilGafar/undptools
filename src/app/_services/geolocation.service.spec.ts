import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { GeolocationService, GeoError, GeoPosition } from './geolocation.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockGeoSuccess(pos: Partial<GeolocationCoordinates>, ts = 0) {
  (navigator as any).geolocation = {
    getCurrentPosition: (success: PositionCallback) =>
      success({
        coords: { latitude: 4.05, longitude: 9.7, accuracy: 15, ...pos } as GeolocationCoordinates,
        timestamp: ts,
      } as GeolocationPosition),
  };
}

function mockGeoError(code: 1 | 2 | 3) {
  (navigator as any).geolocation = {
    getCurrentPosition: (_: any, error: PositionErrorCallback) =>
      error({ code, message: 'native error' } as GeolocationPositionError),
  };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('GeolocationService', () => {
  let service: GeolocationService;

  function setup(platformId: string) {
    TestBed.configureTestingModule({
      providers: [
        GeolocationService,
        { provide: PLATFORM_ID, useValue: platformId },
      ],
    });
    service = TestBed.inject(GeolocationService);
  }

  afterEach(() => {
    // Nettoyage pour ne pas polluer les tests suivants
    delete (navigator as any).geolocation;
  });

  // ── isAvailable ─────────────────────────────────────────────────────────────

  describe('isAvailable()', () => {
    it('retourne false en contexte SSR', () => {
      setup('server');
      expect(service.isAvailable()).toBeFalse();
    });

    it('retourne true en navigateur avec geolocation disponible', () => {
      setup('browser');
      mockGeoSuccess({});
      expect(service.isAvailable()).toBeTrue();
    });

    it('retourne false si navigator.geolocation est absent', () => {
      setup('browser');
      delete (navigator as any).geolocation;
      expect(service.isAvailable()).toBeFalse();
    });
  });

  // ── getCurrentPosition — succès ──────────────────────────────────────────────

  describe('getCurrentPosition() — succès', () => {
    beforeEach(() => setup('browser'));

    it('émet une GeoPosition avec les coordonnées correctes', fakeAsync(() => {
      mockGeoSuccess({ latitude: 4.05, longitude: 9.70, accuracy: 20 });
      let result: GeoPosition | undefined;

      service.getCurrentPosition().subscribe(pos => (result = pos));
      tick();

      expect(result).toBeDefined();
      expect(result!.latitude).toBe(4.05);
      expect(result!.longitude).toBe(9.70);
      expect(result!.accuracy).toBe(20);
    }));

    it('passe isLocating$ à true pendant la capture puis à false', fakeAsync(() => {
      const states: boolean[] = [];
      service.isLocating$.subscribe(v => states.push(v));

      mockGeoSuccess({});
      service.getCurrentPosition().subscribe();
      tick();

      expect(states).toEqual([false, true, false]);
    }));
  });

  // ── getCurrentPosition — erreurs ──────────────────────────────────────────────

  describe('getCurrentPosition() — erreurs navigateur', () => {
    beforeEach(() => setup('browser'));

    it('throw PERMISSION_DENIED quand code natif = 1', fakeAsync(() => {
      mockGeoError(1);
      let err: GeoError | undefined;

      service.getCurrentPosition().subscribe({ error: e => (err = e) });
      tick();

      expect(err?.code).toBe('PERMISSION_DENIED');
      expect(err?.message).toContain('refusé');
    }));

    it('throw POSITION_UNAVAILABLE quand code natif = 2', fakeAsync(() => {
      mockGeoError(2);
      let err: GeoError | undefined;

      service.getCurrentPosition().subscribe({ error: e => (err = e) });
      tick();

      expect(err?.code).toBe('POSITION_UNAVAILABLE');
    }));

    it('throw TIMEOUT quand code natif = 3', fakeAsync(() => {
      mockGeoError(3);
      let err: GeoError | undefined;

      service.getCurrentPosition().subscribe({ error: e => (err = e) });
      tick();

      expect(err?.code).toBe('TIMEOUT');
    }));

    it('repasse isLocating$ à false après une erreur', fakeAsync(() => {
      const states: boolean[] = [];
      service.isLocating$.subscribe(v => states.push(v));

      mockGeoError(1);
      service.getCurrentPosition().subscribe({ error: () => {} });
      tick();

      expect(states).toEqual([false, true, false]);
    }));
  });

  // ── getCurrentPosition — gardes ───────────────────────────────────────────────

  describe('getCurrentPosition() — gardes', () => {
    it('throw SSR_UNAVAILABLE côté serveur', fakeAsync(() => {
      setup('server');
      let err: GeoError | undefined;

      service.getCurrentPosition().subscribe({ error: e => (err = e) });
      tick();

      expect(err?.code).toBe('SSR_UNAVAILABLE');
    }));

    it('throw NOT_SUPPORTED si geolocation absent', fakeAsync(() => {
      setup('browser');
      delete (navigator as any).geolocation;
      let err: GeoError | undefined;

      service.getCurrentPosition().subscribe({ error: e => (err = e) });
      tick();

      expect(err?.code).toBe('NOT_SUPPORTED');
    }));
  });
});
