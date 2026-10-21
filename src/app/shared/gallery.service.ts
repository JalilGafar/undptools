import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environment/environment';
import { CompanyGallery, ImageCategory, ImageStage } from '../core/model/company-image';

/** Galerie d'images d'une entreprise. Les images sont protégées : elles sont lues en blob avec le jeton. */
@Injectable({ providedIn: 'root' })
export class GalleryService {

  private base = `${environment.apiUrl}/api/gallery`;

  constructor(private http: HttpClient) { }

  list(compId: number): Observable<CompanyGallery> {
    return this.http.get<CompanyGallery>(`${this.base}/company/${compId}`);
  }

  upload(compId: number, files: File[], meta: { category: ImageCategory; stage: ImageStage; legend: string }): Observable<{ added: number }> {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    formData.append('category', meta.category);
    formData.append('stage', meta.stage);
    formData.append('legend', meta.legend);
    return this.http.post<{ added: number }>(`${this.base}/company/${compId}`, formData);
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
