import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, throwError } from 'rxjs';

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;   // précision en mètres
  timestamp: number;
}

export type GeoErrorCode =
  | 'NOT_SUPPORTED'
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'SSR_UNAVAILABLE';

export interface GeoError {
  code: GeoErrorCode;
  message: string;
}

const GEO_MESSAGES: Record<GeoErrorCode, string> = {
  NOT_SUPPORTED:
    'Votre navigateur ne supporte pas la géolocalisation.',
  PERMISSION_DENIED:
    "Vous avez refusé l'accès à votre position. Vous pouvez modifier ce choix dans les paramètres de votre navigateur.",
  POSITION_UNAVAILABLE:
    "Position indisponible. Vérifiez que le GPS est activé et que vous avez du signal.",
  TIMEOUT:
    "La capture de votre position a pris trop de temps. Réessayez ou saisissez les coordonnées manuellement.",
  SSR_UNAVAILABLE:
    "La géolocalisation n'est disponible que côté navigateur.",
};

@Injectable({ providedIn: 'root' })
export class GeolocationService {

  private platformId = inject(PLATFORM_ID);

  private _isLocating$ = new BehaviorSubject<boolean>(false);
  get isLocating$(): Observable<boolean> {
    return this._isLocating$.asObservable();
  }

  /**
   * Émet une fois la position GPS puis complete.
   * Throw une GeoError typée sur tout échec.
   */
  getCurrentPosition(options?: PositionOptions): Observable<GeoPosition> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => this.makeError('SSR_UNAVAILABLE'));
    }

    if (!('geolocation' in navigator)) {
      return throwError(() => this.makeError('NOT_SUPPORTED'));
    }

    const mergedOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 60000,
      maximumAge: 0,
      ...options,
    };

    return new Observable<GeoPosition>(observer => {
      this._isLocating$.next(true);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this._isLocating$.next(false);
          observer.next({
            latitude:  pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy:  pos.coords.accuracy,
            timestamp: pos.timestamp,
          });
          observer.complete();
        },
        (err) => {
          this._isLocating$.next(false);
          observer.error(this.makeError(this.mapNativeCode(err.code)));
        },
        mergedOptions,
      );
    });
  }

  /** Retourne true uniquement en contexte navigateur avec l'API disponible. */
  isAvailable(): boolean {
    return (
      isPlatformBrowser(this.platformId) &&
      typeof navigator !== 'undefined' &&
      'geolocation' in navigator
    );
  }

  /**
   * Interroge l'état de permission sans déclencher de prompt.
   * Retourne null si l'API Permissions n'est pas supportée.
   */
  async getPermissionState(): Promise<PermissionState | null> {
    if (!this.isAvailable() || !('permissions' in navigator)) return null;
    try {
      const status = await navigator.permissions.query({
        name: 'geolocation' as PermissionName,
      });
      return status.state; // 'granted' | 'denied' | 'prompt'
    } catch {
      return null;
    }
  }

  private mapNativeCode(code: number): GeoErrorCode {
    switch (code) {
      case 1:  return 'PERMISSION_DENIED';
      case 2:  return 'POSITION_UNAVAILABLE';
      case 3:  return 'TIMEOUT';
      default: return 'POSITION_UNAVAILABLE';
    }
  }

  private makeError(code: GeoErrorCode): GeoError {
    return { code, message: GEO_MESSAGES[code] };
  }
}
