import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, concatMap, defer, from, map, switchMap, tap, throwError, toArray } from 'rxjs';
import { environment } from '../../environment/environment';
import { CompanyGallery, ImageCategory, ImageStage } from '../core/model/company-image';
import { compressImage } from './image-compress';

/** Galerie d'images d'une entreprise. Les images sont protégées : elles sont lues en blob avec le jeton. */
@Injectable({ providedIn: 'root' })
export class GalleryService {

  private base = `${environment.apiUrl}/api/gallery`;

  constructor(private http: HttpClient) { }

  list(compId: number): Observable<CompanyGallery> {
    return this.http.get<CompanyGallery>(`${this.base}/company/${compId}`);
  }

  /**
   * Envoie les images une par une, réduites dans le navigateur, en JSON (la couche d'entrée de l'hébergeur refuse le multipart).
   * Si une image échoue, celles qui précèdent sont déjà enregistrées : le message l'indique pour éviter les doublons.
   */
  upload(compId: number, files: File[], meta: { category: ImageCategory; stage: ImageStage; legend: string }): Observable<{ added: number }> {
    return defer(() => {
      let added = 0;
      return from(files).pipe(
        concatMap(file => from(compressImage(file, { maxSide: 1600, maxBytes: 900_000 })).pipe(
          switchMap(image => this.http.post<{ added: number }>(`${this.base}/company/${compId}/json`, { image, ...meta })),
          tap(res => added += res.added),
        )),
        toArray(),
        map(() => ({ added })),
        catchError(err => {
          const reason = err?.error?.message ?? err?.message ?? 'Une erreur est survenue. Veuillez réessayer.';
          const message = added ? `${added} image(s) déjà enregistrée(s), puis : ${reason}` : reason;
          return throwError(() => ({ error: { message } }));
        })
      );
    });
  }

  remove(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/image/${imageId}`);
  }

  /** Retourne une URL locale (blob:) utilisable dans un <img>. À libérer avec URL.revokeObjectURL. */
  imageUrl(imageId: number, size: 'thumb' | 'full'): Observable<string> {
    return this.http.get(`${this.base}/image/${imageId}`, { params: { size }, responseType: 'blob' })
      .pipe(map(blob => URL.createObjectURL(blob)));
  }
}
